import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { RawSegment } from '@plusone/gpx-toolbox-utils'

import { useCombineState } from '../hooks/useCombineState'
import { routeColor } from '../utils/routeColors'

import { DistanceRangeSlider } from './DistanceRangeSlider'

type SegmentPickerProps = {
  routeId: string
  routeName: string
  segments: Array<RawSegment>
}

// Colors for segment types
const segmentTypeColor: Record<string, string> = {
  uphill: '#e53935',
  downhill: '#43a047',
  flat: '#1e88e5',
}

const segmentTypeLabel: Record<string, string> = {
  uphill: 'combine.uphill',
  downhill: 'combine.downhill',
  flat: 'combine.flat',
}

export function SegmentPicker({ routeId, routeName, segments }: SegmentPickerProps) {
  const { t } = useTranslation()
  const { orderedSegments, addSegment, removeSegment, updateSegmentRange, setHoveredSegmentId, sourceRoutes } =
    useCombineState()

  // Find the index of this route in sourceRoutes for color assignment
  const routeIndex = Array.from(sourceRoutes.keys()).indexOf(routeId)
  const color = routeColor(routeIndex >= 0 ? routeIndex : 0)

  // Find the currently selected segments for this route
  const selectedSegmentIds = orderedSegments.filter((s) => s.routeId === routeId)

  const toggleSegment = useCallback(
    (index: number, segment: RawSegment) => {
      const segId = `${routeId}-${index}`
      const exists = orderedSegments.some((s) => s.id === segId)
      if (exists) {
        removeSegment(segId)
      } else {
        addSegment(routeId, index, segment)
      }
    },
    [routeId, orderedSegments, addSegment, removeSegment],
  )

  const onRangeChange = useCallback(
    (segmentId: string, value: [number, number]) => {
      updateSegmentRange(segmentId, value[0], value[1])
    },
    [updateSegmentRange],
  )

  if (segments.length === 0) return null

  return (
    <div style={styles.section}>
      <div
        style={{
          ...styles.header,
          backgroundColor: color + '15',
          borderLeft: `3px solid ${color}`,
        }}
      >
        <h4 style={{ ...styles.title, color }}>{routeName}</h4>
        <span style={styles.badge}>
          {segments.length} {t('combine.segments')}
        </span>
      </div>

      <div style={styles.list}>
        {segments.map((segment, index) => {
          const segId = `${routeId}-${index}`
          const isSelected = selectedSegmentIds.some((s) => s.id === segId)
          const selectedSegment = selectedSegmentIds.find((s) => s.id === segId)
          const type = (segment.type ?? 'flat') as string
          const typeColor = segmentTypeColor[type] ?? segmentTypeColor.flat
          const typeLabel = t(segmentTypeLabel[type] ?? segmentTypeLabel.flat)
          const distanceKm = (segment.totalDistance / 1000).toFixed(2)
          const elevationGain = Math.round(segment.elevationGain ?? 0)

          return (
            <div
              key={segId}
              style={{
                ...styles.item,
                borderLeft: `3px solid ${color}`,
              }}
              onMouseEnter={() => setHoveredSegmentId(segId)}
              onMouseLeave={() => setHoveredSegmentId(null)}
            >
              <div style={styles.itemHeader}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSegment(index, segment)}
                    style={styles.checkbox}
                  />
                </label>
                <div
                  style={{
                    ...styles.typeBadge,
                    backgroundColor: typeColor + '20',
                    color: typeColor,
                  }}
                >
                  {typeLabel}
                </div>
                <div style={styles.meta}>
                  <span>{distanceKm} km</span>
                  <span>↑ {elevationGain} m</span>
                </div>
              </div>

              {isSelected && selectedSegment && (
                <div style={styles.sliderContainer}>
                  <DistanceRangeSlider
                    points={segment.points}
                    value={[selectedSegment.startKm, selectedSegment.endKm]}
                    onChange={(value) => onRangeChange(segId, value)}
                  />
                  <div style={styles.rangeLabels}>
                    <span>{selectedSegment.startKm.toFixed(2)} km</span>
                    <span>{selectedSegment.endKm.toFixed(2)} km</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  section: {
    marginBottom: 16,
    border: '1px solid #e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
  } as const,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #e0e0e0',
  } as const,
  title: {
    fontSize: 13,
    fontWeight: 600,
    margin: 0,
    color: '#333',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as const,
  badge: {
    fontSize: 11,
    padding: '2px 6px',
    backgroundColor: '#e8eaf6',
    color: '#3949ab',
    borderRadius: 4,
    flexShrink: 0,
  } as const,
  list: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 400,
    overflowY: 'auto',
  } as const,
  item: {
    padding: '8px 12px',
    borderBottom: '1px solid #f0f0f0',
  } as const,
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  } as const,
  checkboxLabel: {
    display: 'flex',
    cursor: 'pointer',
  } as const,
  checkbox: {
    width: 16,
    height: 16,
    cursor: 'pointer',
  } as const,
  typeBadge: {
    fontSize: 11,
    padding: '2px 6px',
    borderRadius: 4,
    fontWeight: 500,
    textTransform: 'uppercase',
    flexShrink: 0,
  } as const,
  meta: {
    fontSize: 12,
    color: '#888',
    display: 'flex',
    gap: 8,
    marginLeft: 'auto',
    flexShrink: 0,
  } as const,
  sliderContainer: {
    marginTop: 8,
    paddingLeft: 24,
  } as const,
  rangeLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  } as const,
}
