import { useState, type DragEvent, type ChangeEvent } from 'react'
import { XMLParser } from 'fast-xml-parser'
import type { TrackPoint } from '@plusone/gpx'
import {
  calculateHaversineDistance,
  renderSvg,
  calculateTotalDistance,
  calculateElevationGain,
  calculateElevationLoss,
  calculateDuration,
  calculateAvgSpeed,
  calculateMaxSpeed,
  getTimeRange,
} from '@plusone/gpx'
import { RangeSlider } from './RangeSlider'
import { SegmentStats } from './SegmentStats'
import { ElevationProfile } from './ElevationProfile'
import { formatDistance, formatDuration } from '../utils/format'

interface SidebarProps {
  onFileLoad?: (points: TrackPoint[], fileName: string) => void
  points?: TrackPoint[]
  fileName?: string
  segmentRange?: [number, number]
  onSegmentRangeChange?: (range: [number, number]) => void
  onExportGpx?: (points: TrackPoint[]) => void
  onExportSvg?: (points: TrackPoint[]) => void
}

export function Sidebar({
  onFileLoad,
  points,
  fileName,
  segmentRange = [0, 100],
  onSegmentRangeChange,
  onExportGpx,
  onExportSvg,
}: SidebarProps) {
  const [dragging, setDragging] = useState(false)

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const parsed = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' }).parse(text)
      const track = parsed.gpx?.trk?.trkseg?.trkpt

      if (!track) {
        alert('Kein Track in der GPX-Datei gefunden.')
        return
      }

      const trackPoints: TrackPoint[] = track.map((trkpt: any) => ({
        latitude: parseFloat(trkpt['@_lat']),
        longitude: parseFloat(trkpt['@_lon']),
        elevation: parseFloat(trkpt.ele ?? '0'),
        time: new Date(trkpt.time),
        hr: trkpt?.extensions?.gpxtpx?.TrackPointExtension?.gpxtpx?.hr
          ? parseInt(trkpt.extensions.gpxtpx.TrackPointExtension.gpxtpx.hr, 10)
          : undefined,
        cad: trkpt?.extensions?.gpxtpx?.TrackPointExtension?.gpxtpx?.cad
          ? parseInt(trkpt.extensions.gpxtpx.TrackPointExtension.gpxtpx.cad, 10)
          : undefined,
      }))

      onFileLoad?.(trackPoints, file.name.replace(/\.gpx$/i, ''))
    }
    reader.readAsText(file)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    setDragging(false)
    const file = event.dataTransfer?.files[0]
    if (file && file.name.endsWith('.gpx')) {
      handleFile(file)
    }
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h2 style={styles.logo}>GPX-Toolbox</h2>
      </div>

      <div style={styles.content}>
        <FileUpload
          dragging={dragging}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onFileInput={handleFileInput}
        />

        {points && points.length > 0 && (
          <>
            <div style={styles.divider} />
            <TrackInfo
              points={points}
              fileName={fileName}
              range={segmentRange}
              onExportGpx={onExportGpx}
              onExportSvg={onExportSvg}
            />
            <div style={styles.divider} />
            <SegmentControls
              points={points}
              range={segmentRange}
              onRangeChange={onSegmentRangeChange}
              onExportGpx={onExportGpx}
              onExportSvg={onExportSvg}
            />
          </>
        )}
      </div>
    </div>
  )
}

interface FileUploadProps {
  dragging: boolean
  onDragOver: (e: DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  onDrop: (e: DragEvent<HTMLDivElement>) => void
  onFileInput: (e: ChangeEvent<HTMLInputElement>) => void
}

function FileUpload({ dragging, onDragOver, onDragLeave, onDrop, onFileInput }: FileUploadProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        ...styles.dropZone,
        borderColor: dragging ? '#2563eb' : '#444',
        backgroundColor: dragging ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.05)',
      }}
    >
      <div style={styles.dropContent}>
        <span style={styles.dropIcon}>📁</span>
        <p style={styles.dropHint}>GPX-Datei hierher ziehen oder</p>
        <label style={styles.dropButton}>
          Datei auswählen
          <input type="file" accept=".gpx" onChange={onFileInput} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  )
}

interface TrackInfoProps {
  points: TrackPoint[]
  fileName?: string
  range: [number, number]
  onExportGpx?: (points: TrackPoint[]) => void
  onExportSvg?: (points: TrackPoint[]) => void
}

function TrackInfo({ points, fileName, range, onExportGpx, onExportSvg }: TrackInfoProps) {
  const totalDistance = calculateTotalDistance(points)
  const elevationGain = calculateElevationGain(points)
  const elevationLoss = calculateElevationLoss(points)
  const duration = calculateDuration(points)
  const avgSpeed = calculateAvgSpeed(totalDistance, duration)
  const maxSpeed = calculateMaxSpeed(points)
  const timeRange = getTimeRange(points)
  const [exportingGpx, setExportingGpx] = useState(false)
  const [exportingSvg, setExportingSvg] = useState(false)

  function handleExportGpx() {
    setExportingGpx(true)
    try {
      const gpx = buildGpx(points, fileName || 'track')
      const blob = new Blob([gpx], { type: 'application/gpx+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName || 'track'}.gpx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setExportingGpx(false)
    }
  }

  function handleExportSvg() {
    setExportingSvg(true)
    try {
      const { svg } = renderSvg({ points, rotate: true })
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName || 'track'}.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setExportingSvg(false)
    }
  }

  return (
    <div style={styles.infoSection}>
      <h3 style={styles.infoTitle}>Gesamt</h3>
      <div style={styles.infoGrid}>
        <Stat label="Distanz" value={formatDistance(totalDistance)} />
        <Stat label="Höhenmeter ↑" value={`${Math.round(elevationGain)} m`} />
        <Stat label="Tiefenmeter ↓" value={`${Math.round(elevationLoss)} m`} />
        <Stat label="Dauer" value={formatDuration(duration)} />
        <Stat label="Ø Geschw." value={`${avgSpeed} km/h`} />
        <Stat label="Max Geschw." value={`${maxSpeed} km/h`} />
        <Stat label="Zeit" value={timeRange} />
      </div>

      <ElevationProfile points={points} range={range} />

      <div style={styles.exportRow}>
        <button
          onClick={handleExportGpx}
          disabled={exportingGpx || points.length < 2}
          style={{
            ...styles.exportButton,
            ...styles.exportButtonGpx,
            opacity: exportingGpx || points.length < 2 ? 0.5 : 1,
          }}
        >
          {exportingGpx ? '…' : 'GPX'}
        </button>
        <button
          onClick={handleExportSvg}
          disabled={exportingSvg || points.length < 2}
          style={{
            ...styles.exportButton,
            ...styles.exportButtonSvg,
            opacity: exportingSvg || points.length < 2 ? 0.5 : 1,
          }}
        >
          {exportingSvg ? '…' : 'SVG'}
        </button>
      </div>
    </div>
  )
}

interface SegmentControlsProps {
  points: TrackPoint[]
  range: [number, number]
  onRangeChange: ((range: [number, number]) => void) | undefined
  onExportGpx?: (points: TrackPoint[]) => void
  onExportSvg?: (points: TrackPoint[]) => void
}

function SegmentControls({ points, range, onRangeChange, onExportGpx, onExportSvg }: SegmentControlsProps) {
  const [exportingGpx, setExportingGpx] = useState(false)
  const [exportingSvg, setExportingSvg] = useState(false)

  // Compute selected segment points
  const startIdx = Math.round((range[0] / 100) * (points.length - 1))
  const endIdx = Math.round((range[1] / 100) * (points.length - 1))
  const segmentPoints = points.slice(startIdx, endIdx + 1)

  function handleExportGpx() {
    if (segmentPoints.length < 2) return
    setExportingGpx(true)
    try {
      const gpx = buildGpx(segmentPoints, 'segment')
      const blob = new Blob([gpx], { type: 'application/gpx+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `segment.gpx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setExportingGpx(false)
    }
  }

  function handleExportSvg() {
    if (segmentPoints.length < 2) return
    setExportingSvg(true)
    try {
      const { svg } = renderSvg({ points: segmentPoints, rotate: true })
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `segment.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setExportingSvg(false)
    }
  }

  return (
    <div style={styles.infoSection}>
      <h3 style={styles.infoTitle}>Segment</h3>

      <RangeSlider value={range} onChange={onRangeChange ?? (() => {})} />
      <SegmentStats points={segmentPoints} />

      <div style={styles.exportRow}>
        <button
          onClick={handleExportGpx}
          disabled={exportingGpx || segmentPoints.length < 2}
          style={{
            ...styles.exportButton,
            ...styles.exportButtonGpx,
            opacity: exportingGpx || segmentPoints.length < 2 ? 0.5 : 1,
          }}
        >
          {exportingGpx ? '…' : 'GPX'}
        </button>
        <button
          onClick={handleExportSvg}
          disabled={exportingSvg || segmentPoints.length < 2}
          style={{
            ...styles.exportButton,
            ...styles.exportButtonSvg,
            opacity: exportingSvg || segmentPoints.length < 2 ? 0.5 : 1,
          }}
        >
          {exportingSvg ? '…' : 'SVG'}
        </button>
      </div>
    </div>
  )
}

function buildGpx(points: TrackPoint[], fileName: string): string {
  const trkpts = points
    .map(
      (p) =>
        `    <trkpt lat="${p.latitude}" lon="${p.longitude}">
      <ele>${p.elevation}</ele>
      <time>${p.time.toISOString()}</time>
    </trkpt>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GPX-Toolbox" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`
}

interface StatProps {
  label: string
  value: string
}

function Stat({ label, value }: StatProps) {
  return (
    <div style={styles.stat}>
      <span style={styles.statLabel}>{label}</span>
      <span style={styles.statValue}>{value}</span>
    </div>
  )
}

const styles = {
  sidebar: {
    width: '400px',
    height: '100%',
    background: '#1e293b',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column' as const,
    borderRight: '1px solid #334155',
    overflow: 'auto',
  },
  header: {
    padding: '1.25rem 1rem 0.75rem',
    borderBottom: '1px solid #334155',
  },
  logo: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#f8fafc',
    margin: 0,
    letterSpacing: '0.02em',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '1rem',
    gap: '1rem',
    overflow: 'auto',
  },
  dropZone: {
    border: '2px dashed',
    borderRadius: '8px',
    padding: '1.5rem 1rem',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  dropContent: {
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
  },
  dropIcon: {
    fontSize: '2rem',
  },
  dropHint: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    margin: 0,
  },
  dropButton: {
    display: 'inline-block',
    padding: '0.6rem 1.5rem',
    background: '#2563eb',
    color: '#fff',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.9rem',
    transition: 'background-color 0.2s',
  },
  divider: {
    height: '1px',
    background: '#334155',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  infoTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#f8fafc',
    margin: 0,
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  stat: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#94a3b8',
  },
  statValue: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#e2e8f0',
  },
  exportRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  exportButton: {
    flex: 1,
    padding: '0.6rem 1rem',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.85rem',
    transition: 'background-color 0.2s',
  },
  exportButtonGpx: {
    background: '#059669',
  },
  exportButtonSvg: {
    background: '#7c3aed',
  },
} as const
