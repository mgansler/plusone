import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { GPXViewer } from '../components/GPXViewer'
import { RoutePlannerMap } from '../components/RoutePlannerMap'

type Tab = 'gpx' | 'route-planner'

/** GPX tools page with tabs for different utilities */
export const Route = createFileRoute('/utils')({
  component: UtilsPage,
})

function UtilsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('gpx')

  return (
    <div style={styles.container}>
      <div style={styles.tabBar}>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === 'gpx' ? styles.tabButtonActive : {}),
          }}
          onClick={() => setActiveTab('gpx')}
        >
          GPX Viewer
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === 'route-planner' ? styles.tabButtonActive : {}),
          }}
          onClick={() => setActiveTab('route-planner')}
        >
          Route planen
        </button>
      </div>
      <div style={styles.content}>
        {activeTab === 'gpx' && <GPXViewer />}
        {activeTab === 'route-planner' && <RoutePlannerMap />}
      </div>
    </div>
  )
}

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
  } as const,
  tabBar: {
    display: 'flex',
    gap: '0',
    background: '#0f172a',
    borderBottom: '1px solid #334155',
  } as const,
  tabButton: {
    padding: '10px 20px',
    background: 'transparent',
    color: '#94a3b8',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  } as const,
  tabButtonActive: {
    color: '#fc5c2d',
    borderBottomColor: '#fc5c2d',
  } as const,
  content: {
    flex: 1,
    minHeight: 0,
  } as const,
} as const
