import { useState, type ChangeEvent, type DragEvent } from 'react'
import { type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query'

type UploadGpxModalProps = {
  heading: string
  /** API endpoint the multipart form is posted to */
  endpoint: string
  /** Form field the entered name is sent as */
  nameField: string
  namePlaceholder: string
  /** If false, the name may be left empty and the backend falls back to the GPX track name */
  nameRequired?: boolean
  /** Additional form fields sent with every upload */
  extraFields?: Record<string, string>
  /** Queries to refetch after a successful upload */
  invalidateQueryKeys: Array<QueryKey>
  onClose: () => void
}

/** Modal for manually uploading a GPX file */
export function UploadGpxModal({
  heading,
  endpoint,
  nameField,
  namePlaceholder,
  nameRequired = true,
  extraFields = {},
  invalidateQueryKeys,
  onClose,
}: UploadGpxModalProps) {
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) return
      const formData = new FormData()
      formData.append('file', file)
      if (name.trim()) formData.append(nameField, name.trim())
      for (const [key, value] of Object.entries(extraFields)) {
        formData.append(key, value)
      }

      const token = localStorage.getItem('gpx-toolbox-jwt')
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Upload fehlgeschlagen')
      }
      return res.json()
    },
    onSuccess: () => {
      for (const queryKey of invalidateQueryKeys) {
        void queryClient.invalidateQueries({ queryKey })
      }
      onClose()
    },
  })

  function handleFile(selectedFile: File) {
    if (!selectedFile.name.toLowerCase().endsWith('.gpx')) {
      alert('Bitte nur GPX-Dateien hochladen.')
      return
    }
    setFile(selectedFile)
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    setDragging(false)
    const dropped = e.dataTransfer?.files?.[0]
    if (dropped) handleFile(dropped)
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate()
  }

  const canSubmit = file !== null && (!nameRequired || name.trim().length > 0) && !mutation.isPending

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.heading}>{heading}</h3>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* File drop zone */}
          <label
            style={{
              ...styles.dropZone,
              borderColor: dragging ? '#3b82f6' : '#cbd5e1',
              backgroundColor: dragging ? 'rgba(59,130,246,0.05)' : '#f8fafc',
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input type="file" accept=".gpx" onChange={handleInputChange} style={{ display: 'none' }} />
            {file ? (
              <div style={styles.fileSelected}>
                <span style={styles.fileIcon}>📁</span>
                <span style={styles.fileName}>{file.name}</span>
                <button
                  type="button"
                  style={styles.fileRemove}
                  onClick={(e) => {
                    e.preventDefault()
                    setFile(null)
                    // Reset the file input so the same file can be re-selected
                    const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement | undefined
                    if (input) input.value = ''
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <div style={styles.dropContent}>
                <span style={styles.dropIcon}>📁</span>
                <span style={styles.dropText}>GPX-Datei hierher ziehen oder klicken</span>
              </div>
            )}
          </label>

          {/* Name input */}
          <input
            type="text"
            placeholder={namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            autoFocus
            required={nameRequired}
          />

          {/* Actions */}
          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                ...styles.submitButton,
                opacity: canSubmit ? 1 : 0.5,
              }}
            >
              {mutation.isPending ? 'Hochladen…' : 'Hochladen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  } as const,
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  } as const,
  heading: {
    margin: '0 0 16px',
    fontSize: 18,
    fontWeight: 600,
    color: '#1e293b',
  } as const,
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  } as const,
  dropZone: {
    border: '2px dashed',
    borderRadius: 8,
    padding: '1.5rem 1rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  } as const,
  dropContent: {
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  } as const,
  dropIcon: {
    fontSize: 24,
  } as const,
  dropText: {
    fontSize: 13,
    color: '#64748b',
  } as const,
  fileSelected: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  } as const,
  fileIcon: {
    fontSize: 18,
  } as const,
  fileName: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as const,
  fileRemove: {
    background: 'none',
    border: 'none',
    fontSize: 20,
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '0 4px',
  } as const,
  input: {
    padding: '8px 12px',
    fontSize: 14,
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    outline: 'none',
  } as const,
  actions: {
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
  } as const,
  cancelButton: {
    padding: '8px 16px',
    fontSize: 14,
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    backgroundColor: '#fff',
    color: '#475569',
    cursor: 'pointer',
  } as const,
  submitButton: {
    padding: '8px 16px',
    fontSize: 14,
    border: 'none',
    borderRadius: 6,
    backgroundColor: '#3b82f6',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 500,
  } as const,
}
