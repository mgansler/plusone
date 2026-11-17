import type { CareNeedDto } from '@plusone/trailcare-api-client'

import { getCategoryLabel } from '../lib/care-needs'

type CareNeedPreviewProps = {
  careNeeds: Array<CareNeedDto>
}

export function CareNeedPreview({ careNeeds }: CareNeedPreviewProps) {
  const active = careNeeds.filter((cn) => !cn.isDone)
  if (active.length === 0) {
    return null
  }

  return (
    <div className="care-need-preview">
      {active.map((cn) => {
        const label = cn.description || getCategoryLabel(cn.category)
        return (
          <span key={cn.id} className="care-need-tag" title={label}>
            {label}
          </span>
        )
      })}
    </div>
  )
}
