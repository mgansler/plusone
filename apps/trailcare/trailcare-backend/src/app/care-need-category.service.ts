import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '@plusone/trailcare-persistence'

import { CareNeedCategoryDto, CreateCareNeedCategoryDto, UpdateCareNeedCategoryDto } from './dto/care-need-category.dto'

@Injectable()
export class CareNeedCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<Array<CareNeedCategoryDto>> {
    const categories = await this.prisma.careNeedCategory.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    })
    return categories.map(toDto)
  }

  async listAll(): Promise<Array<CareNeedCategoryDto>> {
    const categories = await this.prisma.careNeedCategory.findMany({
      orderBy: { name: 'asc' },
    })
    return categories.map(toDto)
  }

  async create(input: CreateCareNeedCategoryDto): Promise<CareNeedCategoryDto> {
    const existing = await this.prisma.careNeedCategory.findUnique({ where: { name: input.name } })
    if (existing && !existing.deletedAt) {
      throw new BadRequestException(`Kategorie "${input.name}" existiert bereits`)
    }

    const category = await this.prisma.careNeedCategory.create({
      data: {
        name: input.name,
        description: input.description || null,
      },
    })
    return toDto(category)
  }

  async update(id: number, input: UpdateCareNeedCategoryDto): Promise<CareNeedCategoryDto> {
    const existing = await this.prisma.careNeedCategory.findUnique({ where: { id } })
    if (!existing || existing.deletedAt) {
      throw new NotFoundException('Kategorie nicht gefunden')
    }

    const data: any = {}
    if (input.name !== undefined) {
      const duplicate = await this.prisma.careNeedCategory.findUnique({ where: { name: input.name } })
      if (duplicate && duplicate.id !== id && !duplicate.deletedAt) {
        throw new BadRequestException(`Kategorie "${input.name}" existiert bereits`)
      }
      data.name = input.name
    }
    if (input.description !== undefined) {
      data.description = input.description || null
    }

    const category = await this.prisma.careNeedCategory.update({ where: { id }, data })
    return toDto(category)
  }

  async softDelete(id: number) {
    const existing = await this.prisma.careNeedCategory.findUnique({ where: { id } })
    if (!existing || existing.deletedAt) {
      throw new NotFoundException('Kategorie nicht gefunden')
    }

    await this.prisma.careNeedCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }
}

function toDto(category: any): CareNeedCategoryDto {
  return {
    id: category.id,
    name: category.name,
    description: category.description ?? undefined,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }
}
