import { useState, type ChangeEvent, type DragEvent } from 'react'
import { type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query'

import { Modal, modalStyles } from './Modal'

type UploadGpxModalProps = {
  heading: string
  /** Sends the file and the entered name (undefined if left empty) with the generated API client */
  upload: (file: File, name: string | undefined) => Promise<unknown>
  namePlaceholder: string
  /** If false, the name may be left empty and the backend falls back to the GPX track name */
  nameRequired?: boolean
  /** Queries to refetch after a successful upload */
  invalidateQueryKeys: Array<QueryKey>
  onClose: () => void
}

/** Modal for manually uploading a GPX file */
export function UploadGpxModal({
  heading,
  upload,
  namePlaceholder,
  nameRequired = true,
  invalidateQueryKeys,
  onClose,
}: UploadGpxModalProps) {
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) return
      return upload(file, name.trim() || undefined)
    },
    onSuccess: () => {
      for (const queryKey of invalidateQueryKeys) {
        void queryClient.invalidateQueries({ queryKey })
      }
      onClose()
    },
  })

  function handleFile(selectedFile: File) {
    // Shown inline: a second modal on top of this one would be clumsy
    if (!selectedFile.name.toLowerCase().endsWith('.gpx')) {
      setFileError('Bitte nur GPX-Dateien hochladen.')
      return
    }
    setFileError(null)
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
    <Modal title={heading} onClose={onClose}>
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
        {fileError && (
          <div role="alert" style={{ ...modalStyles.error, margin: 0 }}>
            {fileError}
          </div>
        )}

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

        <p style={styles.consent}>
          Enthält die Datei Herzfrequenzwerte, werden sie gespeichert. Das sind Gesundheitsdaten, mit dem Hochladen
          willigst du in die Speicherung ein (
          <a href="/datenschutz" target="_blank" rel="noopener noreferrer" style={styles.consentLink}>
            Datenschutzerklärung
          </a>
          ).
        </p>

        {/* Actions */}
        <div style={modalStyles.actions}>
          <button type="button" onClick={onClose} style={modalStyles.cancelButton}>
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              ...modalStyles.submitButton,
              opacity: canSubmit ? 1 : 0.5,
            }}
          >
            {mutation.isPending ? 'Hochladen…' : 'Hochladen'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

const styles = {
  consent: {
    margin: 0,
    fontSize: 12,
    lineHeight: 1.5,
    color: '#64748b',
  } as const,
  consentLink: {
    color: '#475569',
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
}
