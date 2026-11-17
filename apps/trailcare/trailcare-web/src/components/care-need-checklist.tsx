import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import type { CareNeedDto } from '@plusone/trailcare-api-client'
import {
  createCareNeed,
  getGetCareNeedsQueryKey,
  updateCareNeed,
  useGetCareNeedCategories,
  useGetCareNeeds,
} from '@plusone/trailcare-api-client'

import { getCategoryLabel } from '../lib/care-needs'

type CareNeedChecklistProps = {
  trailId: number
}

export function CareNeedChecklist({ trailId }: CareNeedChecklistProps) {
  const { data: careNeeds = [] } = useGetCareNeeds(trailId)
  const { data: categories = [] } = useGetCareNeedCategories()
  const queryClient = useQueryClient()
  const [newCategoryId, setNewCategoryId] = useState<number>(categories[0]?.id ?? 0)
  const [newDescription, setNewDescription] = useState('')

  const { mutate: addCareNeed, isPending: isAdding } = useMutation({
    mutationFn: (data: { categoryId: number; description?: string }) => createCareNeed(trailId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetCareNeedsQueryKey(trailId) })
      setNewDescription('')
    },
  })

  const { mutate: toggleDone, isPending: isToggling } = useMutation({
    mutationFn: (careNeed: CareNeedDto) => updateCareNeed(careNeed.id, { isDone: !careNeed.isDone }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetCareNeedsQueryKey(trailId) })
    },
  })

  const active = careNeeds.filter((cn) => !cn.isDone)
  const done = careNeeds.filter((cn) => cn.isDone)

  console.log(active)

  return (
    <section>
      <h2 className="section-title">Pflegebedarf</h2>

      <form
        className="care-need-form"
        onSubmit={(e) => {
          e.preventDefault()
          addCareNeed({ categoryId: newCategoryId, description: newDescription || undefined })
        }}
      >
        <select value={newCategoryId} onChange={(e) => setNewCategoryId(Number(e.target.value))} aria-label="Kategorie">
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.description || cat.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Beschreibung (optional)"
          maxLength={1000}
        />
        <button type="submit" className="button" disabled={isAdding}>
          Hinzufügen
        </button>
      </form>

      {active.length > 0 && (
        <ul className="care-need-list">
          {active.map((cn) => (
            <li key={cn.id} className="care-need-item">
              <label className="care-need-checkbox">
                <input type="checkbox" checked={false} onChange={() => toggleDone(cn)} disabled={isToggling} />
                <span className="care-need-content">
                  <span className="care-need-category">{getCategoryLabel(cn.category)}</span>
                  {cn.description && <span className="care-need-description">{cn.description}</span>}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <details className="care-need-done">
          <summary>Erledigt ({done.length})</summary>
          <ul className="care-need-list">
            {done.map((cn) => (
              <li key={cn.id} className="care-need-item done">
                <label className="care-need-checkbox">
                  <input type="checkbox" checked={true} onChange={() => toggleDone(cn)} disabled={isToggling} />
                  <span className="care-need-content">
                    <span className="care-need-category">{getCategoryLabel(cn.category)}</span>
                    {cn.description && <span className="care-need-description">{cn.description}</span>}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </details>
      )}

      {careNeeds.length === 0 && <p className="hint">Kein Pflegebedarf eingetragen.</p>}
    </section>
  )
}
