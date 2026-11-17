import { readFile, mkdir, readdir, stat, unlink } from 'node:fs/promises'
import { join } from 'node:path'

import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'

import { PrismaService } from '@plusone/trailcare-persistence'

import { ValidatedConfig } from './config'

export type BackupInfo = {
  fileName: string
  path: string
  sizeBytes: number
  createdAt: string
}

@Injectable()
export class BackupService implements OnModuleInit {
  private readonly logger = new Logger(BackupService.name)
  private readonly backupDir: string | undefined
  private readonly maxBackups: number

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<ValidatedConfig, true>,
  ) {
    this.backupDir = this.config.get('TRAILCARE_BACKUP_DIR')
    this.maxBackups = this.config.get('TRAILCARE_BACKUP_MAX')
  }

  async onModuleInit() {
    if (!this.backupDir) {
      this.logger.warn('TRAILCARE_BACKUP_DIR not set - backup functionality is disabled')
      return
    }

    await mkdir(this.backupDir, { recursive: true })
    this.logger.log(`Backup enabled: directory=${this.backupDir}, maxBackups=${this.maxBackups}`)
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduledBackup() {
    if (!this.backupDir) {
      return
    }

    try {
      const backup = await this.createBackup()
      this.logger.log(`Scheduled backup created: ${backup.fileName}`)
    } catch (error) {
      this.logger.error('Scheduled backup failed', error)
    }
  }

  async createBackup(): Promise<BackupInfo> {
    if (!this.backupDir) {
      throw new Error('Backup is not enabled (TRAILCARE_BACKUP_DIR not set)')
    }
    const dir = this.backupDir

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `backup-${timestamp}.db`
    const fullPath = join(dir, fileName)

    // VACUUM INTO creates a consistent copy of the database
    await this.prisma.$executeRawUnsafe(`VACUUM INTO '${fullPath}'`)
    this.logger.log(`Backup created: ${fileName}`)

    await this.rotateBackups()

    const fileStat = await stat(fullPath)
    return {
      fileName,
      path: fullPath,
      sizeBytes: fileStat.size,
      createdAt: new Date().toISOString(),
    }
  }

  async listBackups(): Promise<Array<BackupInfo>> {
    if (!this.backupDir) {
      return []
    }
    const dir = this.backupDir

    try {
      const files = await readdir(dir)
      const backups = files
        .filter((file) => file.startsWith('backup-') && file.endsWith('.db'))
        .map(async (fileName) => {
          const path = join(dir, fileName)
          const fileStat = await stat(path)
          return {
            fileName,
            path,
            sizeBytes: fileStat.size,
            createdAt: fileStat.mtime.toISOString(),
          }
        })

      const backupInfos = await Promise.all(backups)
      return backupInfos.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    } catch {
      return []
    }
  }

  async downloadBackup(fileName: string): Promise<{ buffer: Buffer; fileName: string }> {
    if (!this.backupDir) {
      throw new Error('Backup is not enabled')
    }
    const dir = this.backupDir

    const fullPath = join(dir, fileName)
    const buffer = await readFile(fullPath)
    this.logger.log(`Backup downloaded: ${fileName}`)
    return { buffer, fileName }
  }

  async deleteBackup(fileName: string): Promise<void> {
    if (!this.backupDir) {
      throw new Error('Backup is not enabled')
    }
    const dir = this.backupDir

    const fullPath = join(dir, fileName)
    await unlink(fullPath)
    this.logger.log(`Maximum number of backups reached, deleted oldest backup: ${fileName}`)
  }

  async rotateBackups() {
    if (!this.backupDir) {
      return
    }

    const backups = await this.listBackups()

    if (backups.length > this.maxBackups) {
      const toDelete = backups.slice(this.maxBackups)
      for (const backup of toDelete) {
        try {
          await this.deleteBackup(backup.fileName)
        } catch (error) {
          this.logger.warn(`Could not delete old backup: ${backup.fileName}`, error)
        }
      }
    }
  }
}
