import { Modal, modalStyles } from './Modal'

type MessageDialogProps = {
  title: string
  message: string
  onClose: () => void
}

/** Replacement for the browser's `alert()` */
export function MessageDialog({ title, message, onClose }: MessageDialogProps) {
  return (
    <Modal title={title} onClose={onClose}>
      <p style={modalStyles.message}>{message}</p>
      <div style={modalStyles.actions}>
        <button type="button" onClick={onClose} autoFocus style={modalStyles.submitButton}>
          OK
        </button>
      </div>
    </Modal>
  )
}
