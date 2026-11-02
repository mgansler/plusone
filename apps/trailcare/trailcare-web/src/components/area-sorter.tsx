import { ArrowDownIcon, ArrowUpIcon } from './icons'

type AreaSorterProps = {
  names: Array<{ id: number; name: string }>
  onMove: (areaId: number, direction: 'up' | 'down') => void
}

/** Lists the areas with buttons to move them, trails are hidden to keep the list short enough to reorder */
export function AreaSorter({ names, onMove }: AreaSorterProps) {
  return (
    <ol className="area-sorter">
      {names.map((area, index) => (
        <li key={area.id} className="area-sorter-item">
          <span className="area-sorter-name">{area.name}</span>
          <button
            type="button"
            className="area-sorter-button"
            aria-label={`${area.name} nach oben`}
            disabled={index === 0}
            onClick={() => onMove(area.id, 'up')}
          >
            <ArrowUpIcon className="area-sorter-icon" />
          </button>
          <button
            type="button"
            className="area-sorter-button"
            aria-label={`${area.name} nach unten`}
            disabled={index === names.length - 1}
            onClick={() => onMove(area.id, 'down')}
          >
            <ArrowDownIcon className="area-sorter-icon" />
          </button>
        </li>
      ))}
    </ol>
  )
}
