import type { BackupInfoDto } from '@plusone/trailcare-api-client'
import { useCreateBackup, useListBackups } from '@plusone/trailcare-api-client'

import { formatDate, formatFileSize } from '../lib/format'

import { useAdminMutationOptions } from './use-admin-mutation'

export function BackupAdmin() {
  const { data: backups, isLoading } = useListBackups()
  const create = useCreateBackup(useAdminMutationOptions())

  if (isLoading) {
    return <p className="hint">Backups werden geladen…</p>
  }

  return (
    <div className="admin-backups">
      <p className="hint">
        Ein Backup erstellt eine konsistente Kopie der Datenbank. Tägliche Backups werden automatisch um 2 Uhr erstellt.
        Ältere Backups werden automatisch gelöscht, sodass maximal 7 Backups vorhanden sind.
      </p>

      <div className="button-row" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <button className="button button-primary" onClick={() => create.mutate()} disabled={create.isPending}>
          {create.isPending ? 'Backup wird erstellt…' : 'Backup erstellen'}
        </button>
      </div>

      {backups?.length === 0 && <p className="hint">Es gibt noch keine Backups.</p>}

      <ul className="admin-backup-list">
        {backups?.map((backup) => (
          <BackupItem key={backup.fileName} backup={backup} />
        ))}
      </ul>
    </div>
  )
}

function BackupItem({ backup }: { backup: BackupInfoDto }) {
  const downloadUrl = `/api/admin/backups/${encodeURIComponent(backup.fileName)}/download`

  return (
    <li className="admin-backup">
      <div className="admin-backup-text">
        <span className="admin-backup-label">{backup.fileName}</span>
        <span className="hint" style={{ marginLeft: '0.5rem' }}>
          {formatFileSize(backup.sizeBytes)}, erstellt am {formatDate(backup.createdAt)}
        </span>
      </div>
      <div className="button-row">
        <a className="text-button" href={downloadUrl} download={backup.fileName}>
          Herunterladen
        </a>
      </div>
    </li>
  )
}
