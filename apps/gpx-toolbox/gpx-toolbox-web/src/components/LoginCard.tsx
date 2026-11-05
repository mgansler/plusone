import { useAuth } from '../lib/auth-context'

/** The login page is opened with `?error=` when the user declined on the Google page */
function loginErrorMessage(): string | null {
  const error = new URLSearchParams(window.location.search).get('error')
  if (!error) return null
  return error === 'access_denied' ? 'Die Anmeldung wurde abgebrochen.' : 'Die Anmeldung ist fehlgeschlagen.'
}

/** The multicolor "G" as published in Google's branding guidelines for the sign-in button */
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" width={18} height={18} aria-hidden="true" style={{ display: 'block' }}>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

/**
 * Reusable login card with the Google sign-in. Used by the root App shell and the /login route.
 */
export function LoginCard() {
  const { isAuthenticated, login, user } = useAuth()

  if (isAuthenticated && user) {
    return (
      <div style={styles.card}>
        <div style={styles.avatar}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name || 'Profile'} style={styles.avatarImg} />
          ) : (
            <span style={styles.avatarFallback}>{user.name?.charAt(0)?.toUpperCase() ?? 'U'}</span>
          )}
        </div>
        <h2 style={styles.welcome}>Willkommen{user.name ? `, ${user.name}` : ''}!</h2>
        <p style={styles.subtitle}>Du bist erfolgreich angemeldet.</p>
        <a href="/" style={styles.link}>
          → Zur Route-Übersicht
        </a>
      </div>
    )
  }

  const error = loginErrorMessage()

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>GPX-Toolcat</h1>
      <p style={styles.description}>
        Plane, speichere und bewerte deine Routen und lade deine Aktivitäten als GPX-Dateien hoch.
      </p>
      <button onClick={login} style={styles.googleButton}>
        <GoogleLogo />
        Mit Google anmelden
      </button>
      {error && <p style={styles.error}>{error}</p>}

      <p style={styles.noteOAuth}>
        Nach dem Klick wirst du zu Google weitergeleitet. Wir speichern deinen Namen, deine E-Mail-Adresse und dein
        Profilbild. Mehr dazu in der{' '}
        <a href="/datenschutz" style={styles.noteLink}>
          Datenschutzerklärung
        </a>
        .
      </p>
      <p style={styles.noteOAuth}>
        <a href="/impressum" style={styles.noteLink}>
          Impressum
        </a>
      </p>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: '3rem 2.5rem',
    maxWidth: 420,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
  } as const,
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1e293b',
    margin: '0 0 0.5rem',
  } as const,
  description: {
    fontSize: 14,
    color: '#64748b',
    margin: '0 0 2rem',
    lineHeight: 1.6,
  } as const,
  // Light theme of Google's sign-in button: https://developers.google.com/identity/branding-guidelines
  googleButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    height: 40,
    padding: '0 12px',
    fontFamily: "Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    fontWeight: 500,
    color: '#1f1f1f',
    backgroundColor: '#fff',
    border: '1px solid #747775',
    borderRadius: 4,
    cursor: 'pointer',
  } as const,
  error: {
    color: '#ef4444',
    fontSize: 13,
    margin: '0.75rem 0 0',
  } as const,
  noteOAuth: {
    fontSize: 12,
    color: '#94a3b8',
    margin: '1.5rem 0 0',
  } as const,
  noteLink: {
    color: '#64748b',
  } as const,
  avatar: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    overflow: 'hidden',
    margin: '0 auto 1.5rem',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  } as const,
  avatarFallback: {
    fontSize: 32,
    fontWeight: 700,
    color: '#64748b',
  } as const,
  welcome: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1e293b',
    margin: '0 0 0.5rem',
  } as const,
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    margin: '0 0 1.5rem',
  } as const,
  link: {
    fontSize: 14,
    fontWeight: 600,
    color: '#3b82f6',
    textDecoration: 'none',
  } as const,
}
