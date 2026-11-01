import { useCallback, useMemo, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { useDebugStravaRequest } from '@plusone/gpx-toolbox-api-client'

import { stravaEndpointGroups } from '../../lib/strava-endpoints'

export const Route = createFileRoute('/debug/')({
  // The backend only offers the debug proxy on the dev server
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw redirect({ to: '/', replace: true })
  },
  component: DebugPage,
})

function DebugPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)
  const [customEndpoint, setCustomEndpoint] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)

  const endpoint = customEndpoint || selectedEndpoint || ''

  const {
    data: response,
    isLoading: loading,
    error,
    isError,
    refetch,
  } = useDebugStravaRequest({ endpoint }, { query: { enabled: endpoint.length > 0 } })

  const toggleGroup = useCallback((groupName: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }))
  }, [])

  const handleSelectEndpoint = useCallback((path: string) => {
    setSelectedEndpoint(path)
    setCustomEndpoint(path)
  }, [])

  const responseJson = useMemo(() => (response ? JSON.stringify(response, null, 2) : null), [response])

  const handleCopy = useCallback(async () => {
    if (!responseJson) return
    try {
      await navigator.clipboard.writeText(responseJson)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }, [responseJson])

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.heading}>Strava Debug</h2>

        {/* Endpoint browser */}
        <div style={styles.browser}>
          {stravaEndpointGroups.map((group) => (
            <div key={group.name} style={styles.group}>
              <button onClick={() => toggleGroup(group.name)} style={styles.groupHeader}>
                <span style={styles.groupName}>
                  {expandedGroups[group.name] ? '▼' : '▶'} {group.name} ({group.endpoints.length})
                </span>
              </button>
              {expandedGroups[group.name] && (
                <div style={styles.endpoints}>
                  {group.endpoints.map((ep) => (
                    <button
                      key={ep.path}
                      onClick={() => handleSelectEndpoint(ep.path)}
                      style={{
                        ...styles.endpointBtn,
                        backgroundColor: selectedEndpoint === ep.path ? '#dbeafe' : 'transparent',
                      }}
                    >
                      <span style={styles.endpointPath}>{ep.path}</span>
                      {ep.pathParams.length > 0 && (
                        <span style={styles.paramHint}>{ep.pathParams.map((p) => `{${p}}`).join(' ')}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Custom endpoint */}
        <div style={styles.section}>
          <label style={styles.label}>Endpoint</label>
          <input
            type="text"
            value={customEndpoint || selectedEndpoint || ''}
            onChange={(e) => {
              setCustomEndpoint(e.target.value)
              setSelectedEndpoint(null)
            }}
            placeholder="/athlete"
            style={styles.input}
          />
        </div>

        {/* Execute button */}
        <button onClick={() => void refetch()} disabled={loading} style={styles.button}>
          {loading ? '⏳' : '▶'} {loading ? 'Anfrage...' : 'Anfrage senden'}
        </button>

        {/* Error */}
        {isError && <div style={styles.error}>{error instanceof Error ? error.message : 'Unbekannter Fehler'}</div>}
      </div>

      {/* Response */}
      <div style={styles.responseArea}>
        {responseJson ? (
          <>
            <div style={styles.responseHeader}>
              <span style={styles.responseLabel}>Response</span>
              <button onClick={handleCopy} style={styles.copyButton}>
                {copied ? '✓ Kopiert' : '📋 Kopieren'}
              </button>
            </div>
            <pre style={styles.json}>{responseJson}</pre>
          </>
        ) : (
          <div style={styles.placeholder}>
            {loading ? 'Lade...' : 'Wähle einen Endpoint und klicke "Anfrage senden"'}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    height: '100%',
    width: '100%',
  } as const,
  sidebar: {
    width: 400,
    flexShrink: 0,
    overflowY: 'auto',
    borderRight: '1px solid #e0e0e0',
    padding: 16,
    backgroundColor: '#fafafa',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  } as const,
  responseArea: {
    flex: 1,
    overflow: 'auto',
    backgroundColor: '#1e293b',
    padding: 16,
    display: 'flex',
    flexDirection: 'column' as const,
  } as const,
  responseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as const,
  responseLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
  } as const,
  copyButton: {
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 500,
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: '1px solid #475569',
    borderRadius: 4,
    cursor: 'pointer',
  } as const,
  heading: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
    color: '#1e293b',
  } as const,
  browser: {
    border: '1px solid #e0e0e0',
    borderRadius: 6,
    backgroundColor: '#fff',
    overflow: 'auto',
    maxHeight: 320,
  } as const,
  group: {
    borderBottom: '1px solid #f0f0f0',
  } as const,
  groupHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    color: '#1e293b',
    textAlign: 'left' as const,
  } as const,
  groupName: {
    fontSize: 13,
  } as const,
  endpoints: {
    display: 'flex',
    flexDirection: 'column' as const,
  } as const,
  endpointBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 12px 6px 24px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    textAlign: 'left' as const,
    transition: 'background-color 0.1s',
  } as const,
  endpointPath: {
    fontFamily: '"Fira Code", "JetBrains Mono", "Consolas", monospace',
    color: '#3b82f6',
  } as const,
  paramHint: {
    fontSize: 10,
    color: '#94a3b8',
    backgroundColor: '#f1f5f9',
    padding: '2px 6px',
    borderRadius: 4,
  } as const,
  section: {
    marginBottom: 0,
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
    fontSize: 13,
    border: '1px solid #ccc',
    borderRadius: 4,
    boxSizing: 'border-box' as const,
    fontFamily: '"Fira Code", "JetBrains Mono", "Consolas", monospace',
  } as const,
  button: {
    width: '100%',
    padding: '10px 16px',
    fontSize: 14,
    fontWeight: 500,
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  } as const,
  error: {
    padding: '8px 12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: 4,
    fontSize: 13,
    marginTop: 12,
  } as const,
  json: {
    margin: 0,
    fontSize: 13,
    color: '#e2e8f0',
    fontFamily: '"Fira Code", "JetBrains Mono", "Consolas", monospace',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word',
  } as const,
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#64748b',
    fontSize: 14,
  } as const,
}
