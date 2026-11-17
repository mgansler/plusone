import type { FormEvent } from 'react'
import { useState } from 'react'

import type { CareNeedCategoryDto } from '@plusone/trailcare-api-client'
import {
  useCreateCareNeedCategory,
  useDeleteCareNeedCategory,
  useGetCareNeedCategories2,
  useUpdateCareNeedCategory,
} from '@plusone/trailcare-api-client'

import { useAdminMutationOptions } from './use-admin-mutation'

export function CareNeedCategoryAdmin() {
  const { data: categories = [] } = useGetCareNeedCategories2()
  return <CareNeedCategoryList categories={categories} />
}

function CareNeedCategoryList({ categories }: { categories: Array<CareNeedCategoryDto> }) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  const create = useCreateCareNeedCategory(
    useAdminMutationOptions(() => {
      setCreating(false)
      setNewName('')
      setNewDescription('')
    }),
  )

  const remove = useDeleteCareNeedCategory(useAdminMutationOptions())

  const onCreate = (e: FormEvent) => {
    e.preventDefault()
    create.mutate({ data: { name: newName, description: newDescription || undefined } })
  }

  return (
    <div>
      <ul className="care-need-category-list">
        {categories.map((cat) => (
          <li key={cat.id} className="care-need-category-item">
            {editingId === cat.id ? (
              <EditForm category={cat} onCancel={() => setEditingId(null)} />
            ) : (
              <div className="care-need-category-row">
                <span className="care-need-category-description">{cat.description || cat.name}</span>
                <div className="care-need-category-actions">
                  <button className="button button-small" type="button" onClick={() => setEditingId(cat.id)}>
                    Bearbeiten
                  </button>
                  <button
                    className="button button-small button-danger"
                    type="button"
                    onClick={() => remove.mutate({ id: cat.id })}
                    disabled={remove.isPending}
                  >
                    Löschen
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {creating ? (
        <form className="care-form" onSubmit={onCreate}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name (z.B. VEGETATION)"
            maxLength={50}
            required
          />
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Beschreibung"
            maxLength={200}
            required
          />
          <div className="button-row">
            <button className="button button-primary" type="submit" disabled={create.isPending}>
              Erstellen
            </button>
            <button className="button" type="button" onClick={() => setCreating(false)}>
              Abbrechen
            </button>
          </div>
        </form>
      ) : (
        <button className="button" type="button" onClick={() => setCreating(true)}>
          Kategorie hinzufügen
        </button>
      )}
    </div>
  )
}

function EditForm({ category, onCancel }: { category: CareNeedCategoryDto; onCancel: () => void }) {
  const [name, setName] = useState(category.name)
  const [description, setDescription] = useState(category.description ?? '')

  const update = useUpdateCareNeedCategory(useAdminMutationOptions(onCancel))

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    update.mutate({
      id: category.id,
      data: { name, description: description || undefined },
    })
  }

  return (
    <form className="care-form" onSubmit={onSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        maxLength={50}
        required
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Beschreibung"
        maxLength={200}
        required
      />
      <div className="button-row">
        <button className="button button-primary" type="submit" disabled={update.isPending}>
          Speichern
        </button>
        <button className="button" type="button" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </form>
  )
}
