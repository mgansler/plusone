import { CareNeed } from '@plusone/trailcare-persistence'

import { CareNeedCategoryRefDto, CareNeedDto } from './dto/care-need.dto'

function toCategoryRef(category: any): CareNeedCategoryRefDto {
  return {
    id: category.id,
    name: category.name,
    description: category.description ?? undefined,
  }
}

export function toCareNeedDto(entry: CareNeed & { category: any }): CareNeedDto {
  return {
    id: entry.id,
    category: toCategoryRef(entry.category),
    description: entry.description ?? undefined,
    isDone: entry.isDone,
    doneAt: entry.doneAt ?? undefined,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  }
}
