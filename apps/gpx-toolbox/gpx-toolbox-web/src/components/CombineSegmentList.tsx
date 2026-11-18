import { useTranslation } from 'react-i18next'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { useCombineState } from '../hooks/useCombineState'

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

function SortableSegmentItem({
  segment,
  index,
  totalSegments,
  removeSegment,
  moveSegmentUp,
  moveSegmentDown,
  setHoveredSegmentId,
  t,
}: {
  segment: NonNullable<ReturnType<typeof useCombineState>['orderedSegments']>[number]
  index: number
  totalSegments: number
  removeSegment: (id: string) => void
  moveSegmentUp: (index: number) => void
  moveSegmentDown: (index: number) => void
  setHoveredSegmentId: (id: string | null) => void
  t: (key: string) => string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: segment.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  }

  const type = segment.type
  const color = segmentTypeColor[type] ?? segmentTypeColor.flat
  const typeLabel = t(segmentTypeLabel[type] ?? segmentTypeLabel.flat)
  const distanceKm = (segment.distance / 1000).toFixed(2)

  return (
    <div
      ref={setNodeRef}
      style={{ ...styles.item, ...style }}
      onMouseEnter={() => setHoveredSegmentId(segment.id)}
      onMouseLeave={() => setHoveredSegmentId(null)}
    >
      <div {...attributes} {...listeners} style={styles.dragHandle} title={t('combine.dragToReorder')}>
        ⠿
      </div>

      <div style={styles.index}>{index + 1}</div>

      <div
        style={{
          ...styles.typeIndicator,
          backgroundColor: color,
        }}
      />

      <div style={styles.itemContent}>
        <div style={styles.itemName}>{segment.routeName}</div>
        <div style={styles.itemMeta}>
          <span
            style={{
              ...styles.typeBadge,
              backgroundColor: color + '20',
              color,
            }}
          >
            {typeLabel}
          </span>
          <span>{distanceKm} km</span>
        </div>
      </div>

      <div style={styles.actions}>
        <button
          onClick={() => moveSegmentUp(index)}
          disabled={index === 0}
          style={{
            ...styles.actionButton,
            opacity: index === 0 ? 0.3 : 1,
          }}
          title={t('combine.moveUp')}
        >
          ↑
        </button>
        <button
          onClick={() => moveSegmentDown(index)}
          disabled={index >= totalSegments - 1}
          style={{
            ...styles.actionButton,
            opacity: index >= totalSegments - 1 ? 0.3 : 1,
          }}
          title={t('combine.moveDown')}
        >
          ↓
        </button>
        <button
          onClick={() => removeSegment(segment.id)}
          style={{
            ...styles.actionButton,
            ...styles.removeButton,
          }}
          title={t('combine.remove')}
        >
          ×
        </button>
      </div>
    </div>
  )
}

export function CombineSegmentList() {
  const { t } = useTranslation()
  const { orderedSegments, removeSegment, moveSegmentUp, moveSegmentDown, moveSegment, setHoveredSegmentId } =
    useCombineState()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      const oldIndex = orderedSegments.findIndex((s) => s.id === active.id)
      const newIndex = orderedSegments.findIndex((s) => s.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        moveSegment(oldIndex, newIndex)
      }
    }
  }

  if (orderedSegments.length === 0) {
    return (
      <div style={styles.section}>
        <h3 style={styles.title}>{t('combine.order')}</h3>
        <div style={styles.empty}>{t('combine.noSegments')}</div>
      </div>
    )
  }

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <h3 style={styles.title}>{t('combine.order')}</h3>
        <span style={styles.badge}>{orderedSegments.length}</span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedSegments.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div style={styles.list}>
            {orderedSegments.map((segment, index) => (
              <SortableSegmentItem
                key={segment.id}
                segment={segment}
                index={index}
                totalSegments={orderedSegments.length}
                removeSegment={removeSegment}
                moveSegmentUp={moveSegmentUp}
                moveSegmentDown={moveSegmentDown}
                setHoveredSegmentId={setHoveredSegmentId}
                t={t}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

const styles = {
  section: {
    marginBottom: 16,
  } as const,
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  } as const,
  title: {
    fontSize: 14,
    fontWeight: 600,
    margin: 0,
    color: '#333',
  } as const,
  badge: {
    fontSize: 11,
    padding: '2px 6px',
    backgroundColor: '#e8eaf6',
    color: '#3949ab',
    borderRadius: 4,
  } as const,
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    maxHeight: 300,
    overflowY: 'auto',
  } as const,
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 8px',
    backgroundColor: '#fafafa',
    borderRadius: 4,
    border: '1px solid #e0e0e0',
  } as const,
  dragHandle: {
    fontSize: 16,
    color: '#bbb',
    cursor: 'grab',
    userSelect: 'none',
    flexShrink: 0,
    width: 20,
    textAlign: 'center',
  } as const,
  index: {
    fontSize: 12,
    fontWeight: 600,
    color: '#999',
    width: 20,
    textAlign: 'center',
    flexShrink: 0,
  } as const,
  typeIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    flexShrink: 0,
  } as const,
  itemContent: {
    flex: 1,
    minWidth: 0,
  } as const,
  itemName: {
    fontSize: 13,
    fontWeight: 500,
    color: '#333',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as const,
  itemMeta: {
    fontSize: 11,
    color: '#888',
    display: 'flex',
    gap: 6,
    marginTop: 2,
    alignItems: 'center',
  } as const,
  typeBadge: {
    fontSize: 10,
    padding: '1px 4px',
    borderRadius: 3,
    fontWeight: 500,
    textTransform: 'uppercase',
  } as const,
  actions: {
    display: 'flex',
    gap: 2,
    flexShrink: 0,
  } as const,
  actionButton: {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: 4,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    color: '#666',
    padding: 0,
  } as const,
  removeButton: {
    color: '#e53935',
    fontSize: 16,
  } as const,
  empty: {
    padding: 16,
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
  } as const,
}
