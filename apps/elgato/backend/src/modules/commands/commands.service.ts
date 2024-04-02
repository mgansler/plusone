import { createHash } from 'node:crypto'

import { Injectable } from '@nestjs/common'

import { Prisma, PrismaService } from '@plusone/elgato-persistence'

import { DeviceService } from '../device/device.service'

import { ActionRequestDto } from './dto/action-request.dto'
import { CommandRequestDto } from './dto/command-request.dto'
import { CommandResponseDto } from './dto/command-response.dto'
import { CommandsListResponseDto } from './dto/commands-list-response.dto'

@Injectable()
export class CommandsService {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly prismaService: PrismaService,
  ) {}

  async createCommand(request: CommandRequestDto): Promise<CommandResponseDto> {
    return this.prismaService.$transaction(async (tx) => {
      const command = await tx.command.create({
        data: { name: request.name, hash: createHash('md5').update(request.name).digest('hex') },
      })

      for (const action of request.actions) {
        await tx.command.update({
          where: { id: command.id },
          data: {
            actions: {
              create: this.actionToPrismaInput(action),
            },
          },
        })
      }

      return tx.command.findUnique({ where: { id: command.id }, include: { actions: true } })
    })
  }

  async getCommands(): Promise<CommandsListResponseDto> {
    return {
      commands: await this.prismaService.command.findMany({
        include: {
          actions: true,
        },
      }),
    }
  }

  async getCommand(commandId: number): Promise<CommandResponseDto> {
    return this.prismaService.command.findUnique({ where: { id: commandId }, include: { actions: true } })
  }

  async updateCommand(commandId: number, commandRequest: CommandRequestDto): Promise<CommandResponseDto> {
    return this.prismaService.$transaction(async (tx) => {
      await tx.command.update({
        where: { id: commandId },
        data: {
          name: commandRequest.name,
          hash: createHash('md5').update(commandRequest.name).digest('hex'),
        },
      })

      await tx.commandAction.deleteMany({ where: { commandId } })

      for (const action of commandRequest.actions) {
        await tx.command.update({
          where: { id: commandId },
          data: {
            actions: {
              create: this.actionToPrismaInput(action),
            },
          },
        })
      }

      return tx.command.findUnique({ where: { id: commandId }, include: { actions: true } })
    })
  }

  async deleteCommand(commandId: number) {
    await this.prismaService.command.delete({ where: { id: commandId } })
  }

  async executeCommand(hash: string) {
    const command = await this.prismaService.command.findUniqueOrThrow({
      where: { hash },
      include: {
        actions: {
          select: {
            macAddress: true,
            on: true,
            powerOnly: true,
            hue: true,
            brightness: true,
            saturation: true,
          },
        },
      },
    })

    for (const { macAddress, on, powerOnly, ...state } of command.actions) {
      // TODO: determine if a certain color/temperature should be set or just on/off
      if (on) {
        if (powerOnly || state.hue === null || state.brightness === null || state.saturation === null) {
          await this.deviceService.setPowerState(macAddress, { on })
        } else {
          await this.deviceService.transitionToColor(macAddress, state)
        }
      } else {
        await this.deviceService.setPowerState(macAddress, { on })
      }
    }
  }

  private actionToPrismaInput(action: ActionRequestDto): Prisma.CommandActionCreateWithoutCommandInput {
    return {
      on: action.on,
      powerOnly: action.powerOnly,
      macAddress: action.macAddress,
      hue: action.powerOnly ? null : action.hue,
      brightness: action.powerOnly ? null : action.brightness,
      saturation: action.powerOnly ? null : action.saturation,
    }
  }
}
