import { useTranslation } from 'react-i18next'

import { Modal, modalStyles } from './Modal'

type ConfirmDialogProps = {
  title: string
  message: string
  confirmLabel: string
  /** Destructive action (e.g. delete): red confirm button */
  danger?: boolean
  /** While the confirmed action runs: buttons disabled, label shows progress */
  pending?: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

/** Replacement for the browser's `confirm()` */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  danger = false,
  pending = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  return (
    <Modal title={title} onClose={pending ? () => undefined : onCancel}>
      <p style={modalStyles.message}>{message}</p>
      {error && <div style={modalStyles.error}>{error}</div>}
      <div style={modalStyles.actions}>
        <button type="button" onClick={onCancel} disabled={pending} style={modalStyles.cancelButton}>
          {t('confirmDialog.cancel')}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          autoFocus
          style={{ ...(danger ? modalStyles.dangerButton : modalStyles.submitButton), opacity: pending ? 0.6 : 1 }}
        >
          {pending ? `${confirmLabel}…` : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
