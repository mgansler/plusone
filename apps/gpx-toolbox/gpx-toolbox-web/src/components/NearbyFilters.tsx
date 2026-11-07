import type { PlaceSearch } from '../hooks/usePlaceSearch'
import type { SearchArea } from '../hooks/useSearchArea'

import { CoordinateInput } from './CoordinateInput'

type NearbyFiltersProps = {
  place: PlaceSearch
  area: SearchArea
  /** Whether the route search is running */
  searching: boolean
  /** Error message of the route search */
  error: string | null
}

/** Search form of the nearby routes: place, coordinates, GPS position and radius. Takes the width it is given. */
export function NearbyFilters({ place, area, searching, error }: NearbyFiltersProps) {
  return (
    <>
      <div style={styles.section}>
        <label htmlFor="nearby-place" style={styles.label}>
          Ort suchen
        </label>
        <div style={styles.placeRow}>
          <input
            id="nearby-place"
            type="text"
            value={place.place}
            onChange={(e) => place.setPlace(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void place.search()
            }}
            style={styles.input}
            placeholder="z. B. Ulm, Schwäbische Alb"
          />
          <button onClick={() => void place.search()} style={styles.searchButton} disabled={place.loading}>
            {place.loading ? '…' : 'Suchen'}
          </button>
        </div>
        {place.error && <div style={styles.placeError}>{place.error}</div>}
        {place.candidates.length > 0 && (
          <div style={styles.candidates}>
            <div style={styles.candidatesTitle}>Welcher Ort ist gemeint?</div>
            {place.candidates.map((candidate) => (
              <button key={candidate.id} onClick={() => place.pick(candidate)} style={styles.candidate}>
                {candidate.label}
              </button>
            ))}
          </div>
        )}
        <div style={styles.hint}>Tipp: auf die Karte klicken oder den Marker ziehen, um den Suchort zu setzen.</div>
      </div>

      <div style={styles.section}>
        <div style={styles.coordinateRow}>
          <CoordinateInput
            label="Breitengrad (lat)"
            value={area.lat}
            onChange={area.setLat}
            onBlur={area.centerOnCurrent}
            placeholder="48.77"
          />
          <CoordinateInput
            label="Längengrad (lng)"
            value={area.lng}
            onChange={area.setLng}
            onBlur={area.centerOnCurrent}
            placeholder="9.16"
          />
        </div>
        <button onClick={area.locateMe} style={styles.gpsButton} disabled={area.usingGps}>
          {area.usingGps ? 'GPS...' : 'GPS-Position'}
        </button>
      </div>

      <div style={styles.section}>
        <label htmlFor="nearby-radius" style={styles.label}>
          Radius: {area.radius >= 1 ? `${area.radius} km` : `${area.radius * 1000} m`}
        </label>
        <input
          id="nearby-radius"
          type="range"
          min={0.5}
          max={30}
          step={0.5}
          value={area.radius}
          onChange={(e) => area.setRadius(parseFloat(e.target.value))}
          style={styles.range}
        />
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {area.lat == null && <div style={styles.loading}>Standort wird ermittelt...</div>}
      {searching && <div style={styles.loading}>Suche...</div>}
    </>
  )
}

const styles = {
  section: {
    marginBottom: 16,
  } as const,
  label: {
    display: 'block',
    marginBottom: 4,
    fontSize: 13,
    fontWeight: 500,
    color: '#555',
  } as const,
  input: {
    width: '100%',
    padding: '8px 12px',
    fontSize: 14,
    border: '1px solid #ccc',
    borderRadius: 4,
    marginBottom: 8,
    boxSizing: 'border-box',
  } as const,
  coordinateRow: {
    display: 'flex',
    gap: 8,
  } as const,
  placeRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
  } as const,
  searchButton: {
    flexShrink: 0,
    padding: '8px 14px',
    fontSize: 14,
    fontWeight: 500,
    backgroundColor: '#2196f3',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    marginBottom: 8,
  } as const,
  hint: {
    fontSize: 12,
    color: '#888',
    marginTop: -4,
    marginBottom: 4,
  } as const,
  candidates: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 8,
    border: '1px solid #e0e0e0',
    borderRadius: 4,
    backgroundColor: '#fff',
    overflow: 'hidden',
  } as const,
  candidatesTitle: {
    padding: '6px 10px',
    fontSize: 12,
    color: '#64748b',
    borderBottom: '1px solid #e0e0e0',
  } as const,
  candidate: {
    padding: '6px 10px',
    fontSize: 13,
    textAlign: 'left',
    border: 'none',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  } as const,
  placeError: {
    padding: '6px 10px',
    backgroundColor: '#fff3e0',
    color: '#e65100',
    borderRadius: 4,
    marginBottom: 8,
    fontSize: 13,
  } as const,
  range: {
    width: '100%',
  } as const,
  gpsButton: {
    width: '100%',
    padding: '10px 16px',
    fontSize: 14,
    fontWeight: 500,
    backgroundColor: '#2196f3',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    marginTop: 8,
  } as const,
  error: {
    padding: '8px 12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: 4,
    marginBottom: 16,
    fontSize: 13,
  } as const,
  loading: {
    padding: 16,
    textAlign: 'center',
    color: '#666',
  } as const,
}
