import { mkdir, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PrismaService } from '@plusone/trailcare-persistence'

import { BackupService } from '../backup.service'

function createMockConfigService(backupDir: string | undefined, maxBackups = 3) {
  return {
    get: (key: string) => {
      if (key === 'TRAILCARE_BACKUP_DIR') return backupDir
      if (key === 'TRAILCARE_BACKUP_MAX') return maxBackups
      return undefined
    },
  } as ConfigService
}

function createMockPrisma() {
  return {
    $executeRawUnsafe: vi.fn().mockImplementation(async (sql: string) => {
      const match = sql.toString().match(/VACUUM INTO '(.+)'/)
      if (match) {
        await writeFile(match[1], 'backup-data')
      }
    }),
  }
}

describe('BackupService', () => {
  let service: BackupService
  let backupDir: string

  beforeEach(async () => {
    backupDir = join(tmpdir(), `backup-test-${Date.now()}`)
    await mkdir(backupDir, { recursive: true })

    const mockPrisma = createMockPrisma()
    const mockConfig = createMockConfigService(backupDir)

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile()

    service = module.get<BackupService>(BackupService)
  })

  afterEach(async () => {
    if (backupDir) {
      await rm(backupDir, { recursive: true, force: true })
    }
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('onModuleInit', () => {
    it('should create the backup directory if it does not exist', async () => {
      const newDir = join(tmpdir(), `backup-test-nonexistent-${Date.now()}`)

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BackupService,
          { provide: PrismaService, useValue: createMockPrisma() },
          { provide: ConfigService, useValue: createMockConfigService(newDir) },
        ],
      }).compile()

      await module.init()

      const statResult = await stat(newDir)
      expect(statResult.isDirectory()).toBe(true)

      await rm(newDir, { recursive: true, force: true })
    })
  })

  describe('createBackup', () => {
    it('should create a backup', async () => {
      const result = await service.createBackup()

      expect(result.fileName).toMatch(/^backup-.*\.db$/)
      expect(result.path).toContain(backupDir)
      expect(result.sizeBytes).toBeGreaterThan(0)
      expect(result.createdAt).toBeDefined()
    })
  })

  describe('listBackups', () => {
    it('should return an empty list when no backups exist', async () => {
      const result = await service.listBackups()
      expect(result).toEqual([])
    })

    it('should list backups sorted newest first', async () => {
      await writeFile(join(backupDir, 'backup-2024-01-01T00-00-00.db'), 'test')
      await new Promise((resolve) => setTimeout(resolve, 10))
      await writeFile(join(backupDir, 'backup-2024-01-02T00-00-00.db'), 'test')

      const result = await service.listBackups()

      expect(result.length).toBe(2)
      expect(result[0].fileName).toBe('backup-2024-01-02T00-00-00.db')
      expect(result[1].fileName).toBe('backup-2024-01-01T00-00-00.db')
    })
  })

  describe('downloadBackup', () => {
    it('should download a backup', async () => {
      const backupFile = 'backup-2024-01-01T00-00-00.db'
      await writeFile(join(backupDir, backupFile), 'backup-data-content')

      const result = await service.downloadBackup(backupFile)

      expect(result.fileName).toBe(backupFile)
      expect(result.buffer.toString()).toBe('backup-data-content')
    })
  })

  describe('deleteBackup (internal, used by rotation)', () => {
    it('should delete a backup', async () => {
      const backupFile = 'backup-2024-01-01T00-00-00.db'
      await writeFile(join(backupDir, backupFile), 'test')

      await service.deleteBackup(backupFile)

      const backups = await service.listBackups()
      expect(backups.length).toBe(0)
    })
  })

  describe('rotateBackups', () => {
    it('should delete old backups when more than maxBackups exist', async () => {
      for (let i = 1; i <= 5; i++) {
        await writeFile(join(backupDir, `backup-2024-01-${String(i).padStart(2, '0')}T00-00-00.db`), 'test')
        await new Promise((resolve) => setTimeout(resolve, 10))
      }

      await service.rotateBackups()

      const backups = await service.listBackups()
      expect(backups.length).toBe(3)
    })
  })

  describe('disabled backup', () => {
    it('should throw when backup is not enabled', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BackupService,
          { provide: PrismaService, useValue: createMockPrisma() },
          { provide: ConfigService, useValue: createMockConfigService(undefined) },
        ],
      }).compile()

      const disabledService = module.get<BackupService>(BackupService)
      await expect(disabledService.createBackup()).rejects.toThrow('Backup is not enabled')
    })

    it('should return empty list when backup is not enabled', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BackupService,
          { provide: PrismaService, useValue: createMockPrisma() },
          { provide: ConfigService, useValue: createMockConfigService(undefined) },
        ],
      }).compile()

      const disabledService = module.get<BackupService>(BackupService)
      const result = await disabledService.listBackups()
      expect(result).toEqual([])
    })
  })
})
