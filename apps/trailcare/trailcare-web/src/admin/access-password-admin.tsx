import type { FormEvent } from 'react'
import { useState } from 'react'

import type { AccessPasswordDto, AccessPasswordWithSecretDto } from '@plusone/trailcare-api-client'
import {
  useCreateAccessPassword,
  useDeleteAccessPassword,
  useGetAccessPasswords,
  useRotateAccessPassword,
  useUpdateAccessPassword,
} from '@plusone/trailcare-api-client'

import { formatDate, relativeDay } from '../lib/format'

import { useAdminMutationOptions } from './use-admin-mutation'

/** Plain passwords are only known right after creating or rotating */
function RevealedPassword({ secret, onClose }: { secret: AccessPasswordWithSecretDto; onClose: () => void }) {
  return (
    <div className="revealed" role="status">
      <p>
        Neues Passwort für <strong>{secret.label}</strong>. Gib es jetzt weiter, es wird später nicht mehr angezeigt.
      </p>
      <code className="revealed-password">{secret.password}</code>
      <div className="button-row">
        <button className="button" onClick={() => navigator.clipboard?.writeText(secret.password)}>
          Kopieren
        </button>
        <button className="button" onClick={onClose}>
          Fertig
        </button>
      </div>
    </div>
  )
}

export function AccessPasswordAdmin() {
  const { data: passwords } = useGetAccessPasswords()
  const [secret, setSecret] = useState<AccessPasswordWithSecretDto | null>(null)
  const [label, setLabel] = useState('')
  const [password, setPassword] = useState('')

  const create = useCreateAccessPassword(useAdminMutationOptions())

  const onCreate = (event: FormEvent) => {
    event.preventDefault()
    create.mutate(
      { data: { label, password: password || undefined } },
      {
        onSuccess: (created) => {
          setSecret(created)
          setLabel('')
          setPassword('')
        },
      },
    )
  }

  return (
    <div className="admin-passwords">
      <p className="hint">
        Alle Passwörter erlauben dasselbe: Trails ansehen und Pflege eintragen. Mit mehreren Passwörtern, etwa eins pro
        Crew, kannst du einzelne ändern, ohne dass sich alle neu anmelden müssen.
      </p>

      {secret && <RevealedPassword secret={secret} onClose={() => setSecret(null)} />}

      <ul className="admin-password-list">
        {passwords?.map((accessPassword) => (
          <AccessPasswordItem key={accessPassword.id} accessPassword={accessPassword} onSecret={setSecret} />
        ))}
      </ul>
      {passwords?.length === 0 && (
        <p className="hint">Es gibt kein Passwort. Ohne Passwort kann sich niemand außer Admins anmelden.</p>
      )}

      <form className="care-form care-form-compact" onSubmit={onCreate}>
        <div className="field-row">
          <label className="field">
            <span>Wofür ist das Passwort?</span>
            <input
              value={label}
              placeholder="z. B. Crew Heslach"
              onChange={(event) => setLabel(event.target.value)}
              maxLength={100}
              required
            />
          </label>
          <label className="field">
            <span>Passwort (leer = erzeugen)</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              maxLength={200}
            />
          </label>
        </div>
        <button className="button button-primary" type="submit" disabled={create.isPending || !label.trim()}>
          Passwort anlegen
        </button>
      </form>
    </div>
  )
}

function AccessPasswordItem({
  accessPassword,
  onSecret,
}: {
  accessPassword: AccessPasswordDto
  onSecret: (secret: AccessPasswordWithSecretDto) => void
}) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [label, setLabel] = useState(accessPassword.label)
  const options = useAdminMutationOptions()
  const rename = useUpdateAccessPassword(useAdminMutationOptions(() => setIsRenaming(false)))
  const rotate = useRotateAccessPassword(options)
  const remove = useDeleteAccessPassword(options)

  const devices = accessPassword.activeSessions
  const devicesText = devices === 1 ? '1 Gerät angemeldet' : `${devices} Geräte angemeldet`

  const onRotate = () => {
    const custom = window.prompt(
      `Neues Passwort für „${accessPassword.label}“. Leer lassen, um eins zu erzeugen. ${devicesText}, sie werden abgemeldet.`,
      '',
    )
    if (custom === null) return
    rotate.mutate(
      { accessPasswordId: accessPassword.id, data: { password: custom.trim() || undefined } },
      { onSuccess: onSecret },
    )
  }

  const onDelete = () => {
    if (window.confirm(`Passwort „${accessPassword.label}“ löschen? ${devicesText}, sie werden abgemeldet.`)) {
      remove.mutate({ accessPasswordId: accessPassword.id })
    }
  }

  return (
    <li className="admin-password">
      {isRenaming ? (
        <form
          className="inline-form"
          onSubmit={(event) => {
            event.preventDefault()
            rename.mutate({ accessPasswordId: accessPassword.id, data: { label } })
          }}
        >
          <label className="field">
            <span>Bezeichnung</span>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              maxLength={100}
              required
              autoFocus
            />
          </label>
          <button className="button button-primary" type="submit" disabled={rename.isPending}>
            Speichern
          </button>
        </form>
      ) : (
        <>
          <div className="admin-password-text">
            <span className="admin-password-label">{accessPassword.label}</span>
            <span className="hint">
              {devicesText},{' '}
              {accessPassword.lastUsedAt
                ? `zuletzt benutzt ${relativeDay(accessPassword.lastUsedAt)}`
                : `angelegt am ${formatDate(accessPassword.updatedAt)}`}
            </span>
          </div>
          <div className="button-row">
            <button className="text-button" onClick={() => setIsRenaming(true)}>
              Umbenennen
            </button>
            <button className="text-button" onClick={onRotate} disabled={rotate.isPending}>
              Passwort ändern
            </button>
            <button className="text-button text-button-danger" onClick={onDelete}>
              Löschen
            </button>
          </div>
        </>
      )}
    </li>
  )
}
