import { type ChangeEvent, type DragEvent, useState } from 'react'

import { parseGpx, type TrackPoint } from '@plusone/gpx-toolbox-utils'

import { MessageDialog } from './MessageDialog'
import { SidebarDivider, SidebarLayout } from './SidebarLayout'
import { TrackAnalysis } from './TrackAnalysis'

type SidebarProps = {
  onFileLoad?: (points: Array<TrackPoint>, fileName: string) => void
  points?: Array<TrackPoint>
  fileName?: string
  segmentRange?: [number, number]
  onSegmentRangeChange?: (range: [number, number]) => void
}

export function Sidebar({ onFileLoad, points, fileName, segmentRange = [0, 0], onSegmentRangeChange }: SidebarProps) {
  const [dragging, setDragging] = useState(false)
  const [noTrackFile, setNoTrackFile] = useState<string | null>(null)

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const trackPoints = parseGpx(text)

      if (trackPoints.length === 0) {
        setNoTrackFile(file.name)
        return
      }

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
    <SidebarLayout>
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

      {points && points.length > 1 && (
        <>
          <SidebarDivider />
          <TrackAnalysis
            points={points}
            range={segmentRange}
            onRangeChange={onSegmentRangeChange ?? (() => undefined)}
            name={fileName}
          />
        </>
      )}

      {noTrackFile && (
        <MessageDialog
          title="Kein Track gefunden"
          message={`In der Datei „${noTrackFile}“ wurde kein Track gefunden.`}
          onClose={() => setNoTrackFile(null)}
        />
      )}
    </SidebarLayout>
  )
}

type FileUploadProps = {
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

const styles = {
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
} as const
