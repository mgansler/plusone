import type { CareNeedCategoryRefDto } from '@plusone/trailcare-api-client'

/** Get the label for a category ref (from API response) */
export function getCategoryLabel(category: CareNeedCategoryRefDto): string {
  return category.description || category.name
}
