import { useStravaAthlete } from '@plusone/gpx-toolbox-api-client'

/**
 * Strava profile card with local stats. Fetches fresh data every time it is mounted
 * (i.e. whenever the user menu is opened); cached data is shown meanwhile.
 */
export function StravaProfile() {
  const {
    data: profile,
    isLoading: loading,
    error,
    isError,
  } = useStravaAthlete({ query: { refetchOnMount: 'always' } })

  return (
    <div style={styles.section}>
      {loading && <p style={styles.loading}>⏳ Lädt...</p>}

      {isError && <p style={styles.error}>{error instanceof Error ? error.message : 'Unbekannter Fehler'}</p>}

      {profile && (
        <div style={styles.profileCard}>
          <div style={styles.avatarRow}>
            {profile.profile_medium && (
              <img src={profile.profile_medium as unknown as string} alt={profile.firstname} style={styles.avatar} />
            )}
            <div style={styles.nameSection}>
              <div style={styles.name}>
                {profile.firstname} {profile.lastname}
              </div>
              {profile.username && <div style={styles.handle}>@{profile.username}</div>}
              {(profile.city || profile.state || profile.country) && (
                <div style={styles.location}>
                  {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
                </div>
              )}
              <a
                href={`https://www.strava.com/athletes/${profile.id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.stravaLink}
              >
                Profil auf Strava ↗
              </a>
            </div>
          </div>

          <div style={styles.statsGrid}>
            <StatItem label="Routen" value={(profile.localStats as { routeCount?: number }).routeCount ?? 0} />
            <StatItem label="Fahrten" value={(profile.localStats as { rideCount?: number }).rideCount ?? 0} />
            <StatItem label="Follower" value={profile.follower_count ?? 0} />
            <StatItem label="Freunde" value={profile.friend_count ?? 0} />
          </div>

          <div style={styles.totalStats}>
            <div style={styles.totalStatItem}>
              <span style={styles.totalStatValue}>
                {formatDistance((profile.localStats as { totalDistanceM?: number }).totalDistanceM ?? 0)}
              </span>
              <span style={styles.totalStatLabel}>Distanz gesamt</span>
            </div>
            <div style={styles.totalStatItem}>
              <span style={styles.totalStatValue}>
                {formatElevation((profile.localStats as { totalElevationM?: number }).totalElevationM ?? 0)}
              </span>
              <span style={styles.totalStatLabel}>Höhenmeter</span>
            </div>
          </div>

          {profile.premium && (
            <div style={styles.premiumBadge}>
              <span style={styles.premiumIcon}>🏆</span> Strava Premium
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.statItem}>
      <span style={styles.statValue}>{formatNumber(value)}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  )
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`
  }
  return `${Math.round(meters)} m`
}

function formatElevation(meters: number): string {
  return `${Math.round(meters)} hm`
}

function formatNumber(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}k`
  }
  return String(n)
}

const styles = {
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  loading: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    margin: 0,
  },
  error: {
    color: '#f87171',
    fontSize: '0.8rem',
    margin: '0.5rem 0',
    padding: '0.5rem',
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderRadius: '6px',
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
    padding: '1rem',
  },
  avatarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid rgba(252,92,45,0.5)',
  },
  nameSection: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  handle: {
    fontSize: '0.8rem',
    color: '#94a3b8',
  },
  stravaLink: {
    display: 'inline-block',
    marginTop: '4px',
    fontSize: '0.8rem',
    color: '#fc5c2d',
    textDecoration: 'none',
  },
  location: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '2px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.5rem',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '6px',
  },
  statValue: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#fc5c2d',
  },
  statLabel: {
    fontSize: '0.7rem',
    color: '#94a3b8',
    marginTop: '2px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  totalStats: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.5rem',
    backgroundColor: 'rgba(252,92,45,0.1)',
    borderRadius: '8px',
    marginBottom: '0.5rem',
  },
  totalStatItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  totalStatValue: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#f8fafc',
  },
  totalStatLabel: {
    fontSize: '0.65rem',
    color: '#94a3b8',
    marginTop: '2px',
  },
  premiumBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    padding: '0.4rem',
    fontSize: '0.75rem',
    color: '#fbbf24',
    fontWeight: 600,
  },
  premiumIcon: {
    fontSize: '0.85rem',
  },
} as const
