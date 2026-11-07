import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/callback')({
  component: CallbackPage,
})

function CallbackPage() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.spinner} />
        <p style={styles.text}>Anmeldung...</p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  } as const,
  card: {
    textAlign: 'center',
  } as const,
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid rgba(255,255,255,0.2)',
    borderTopColor: '#fc5c2d',
    borderRadius: '50%',
    margin: '0 auto 1rem',
    animation: 'spin 0.8s linear infinite',
  } as const,
  text: {
    color: '#fff',
    fontSize: 16,
    margin: 0,
  } as const,
}
