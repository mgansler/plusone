import { useAuth } from '../lib/auth-context'

/** The account of the logged-in user */
export function SettingsView() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Einstellungen</h1>

      <section style={styles.card} aria-labelledby="account-heading">
        <h2 id="account-heading" style={styles.heading}>
          Konto
        </h2>
        <div style={styles.accountRow}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" style={styles.avatar} referrerPolicy="no-referrer" />
          ) : (
            <span style={{ ...styles.avatar, ...styles.avatarFallback }}>
              {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </span>
          )}
          <div>
            <div style={styles.name}>{user.name ?? 'Unbekannt'}</div>
            {user.email && <div style={styles.email}>{user.email}</div>}
          </div>
        </div>
      </section>

      <p style={styles.footer}>
        <a href="/datenschutz" style={styles.footerLink}>
          Datenschutzerklärung
        </a>
        {' · '}
        <a href="/impressum" style={styles.footerLink}>
          Impressum
        </a>
      </p>
    </div>
  )
}

const styles = {
  page: {
    maxWidth: 560,
    margin: '0 auto',
    padding: '2rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1e293b',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  heading: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1e293b',
    margin: '0 0 0.75rem',
  },
  accountRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    objectFit: 'cover',
    backgroundColor: '#f1f5f9',
  },
  avatarFallback: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 700,
    color: '#64748b',
  },
  name: {
    fontWeight: 600,
    color: '#1e293b',
  },
  email: {
    fontSize: 13,
    color: '#64748b',
  },
  footer: {
    fontSize: 13,
    textAlign: 'center',
  },
  footerLink: {
    color: '#64748b',
  },
} as const
