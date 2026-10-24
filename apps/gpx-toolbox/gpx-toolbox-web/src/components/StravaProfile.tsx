import { useState, useCallback } from 'react'

import { useAuth } from '../lib/auth-context'
import { apiFetch } from '../lib/api-client'

/** Athlete profile returned from GET /api/athlete */
type AthleteProfile = {
  id: number
  firstname: string
  lastname: string
  username: string
  profile: string | null
  city: string | null
  state: string | null
  country: string | null
  gender: string
  weight: number | null
  friend: number | null
  follower: number | null
  athleteType: string
  badges: Array<{ type: string; name: string }>
  clubs: Array<{ name: string; profile: string }>
  premium: boolean
  premiumExpiryAt: string | null
  created_at: string
  updated_at: string
  amount_rides: number
  badges_count: number
  follower_count: number
  friend_count: number
  member_type: string
  weight_unit: string
  profile_medium: string | null
  routes_count: number
  rides_count: number
  runs_count: number
  swims_count: number
  recent_rides_count: number
  all_rides_count: number
  all_ride_distances: number
  all_ride_elevations: number
  localStats: {
    routeCount: number
    rideCount: number
    totalDistanceM: number
    totalElevationM: number
  }
}

export function StravaProfile() {
  const [profile, setProfile] = useState<AthleteProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiFetch('/api/auth/athlete', { method: 'GET' })
      if (!response.ok) throw new Error('Fehler beim Laden des Profils')
      const data = await response.json()
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div style={styles.section}>
      <button onClick={fetchProfile} style={styles.button} disabled={loading}>
        {loading ? '⏳' : profile ? '🔄' : '🚴'} {loading ? 'Lädt...' : profile ? 'Aktualisieren' : 'Strava Profil'}
      </button>

      {error && <p style={styles.error}>{error}</p>}

      {profile && (
        <div style={styles.profileCard}>
          <div style={styles.avatarRow}>
            {profile.profile && <img src={profile.profile} alt={profile.firstname} style={styles.avatar} />}
            <div style={styles.nameSection}>
              <div style={styles.name}>
                {profile.firstname} {profile.lastname}
              </div>
              <div style={styles.handle}>@{profile.username}</div>
              {(profile.city || profile.state || profile.country) && (
                <div style={styles.location}>
                  {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
                </div>
              )}
            </div>
          </div>

          <div style={styles.statsGrid}>
            <StatItem label="Routen" value={profile.localStats.routeCount} />
            <StatItem label="Fahrten" value={profile.localStats.rideCount} />
            <StatItem label="Follower" value={profile.follower_count ?? profile.follower ?? 0} />
            <StatItem label="Freunde" value={profile.friend_count ?? profile.friend ?? 0} />
          </div>

          <div style={styles.totalStats}>
            <div style={styles.totalStatItem}>
              <span style={styles.totalStatValue}>{formatDistance(profile.localStats.totalDistanceM)}</span>
              <span style={styles.totalStatLabel}>Distanz gesamt</span>
            </div>
            <div style={styles.totalStatItem}>
              <span style={styles.totalStatValue}>{formatElevation(profile.localStats.totalElevationM)}</span>
              <span style={styles.totalStatLabel}>Höhenmeter</span>
            </div>
          </div>

          {!profile.premium && (
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
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}k hm`
  }
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
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1rem',
    background: 'linear-gradient(135deg, #fc5c2d 0%, #e84a1c 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.85rem',
    transition: 'opacity 0.2s',
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
