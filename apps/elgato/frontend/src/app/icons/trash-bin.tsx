import type { IconProps } from './defaults'
import { defaults } from './defaults'

export function TrashBin({ variant = 'outline', size = defaults.size }: IconProps) {
  return variant === 'solid' ? (
    <svg
      name={`trash-bin-${variant}`}
      className={`w-[${size}px] h-[${size}px] text-gray-800 dark:text-white`}
      aria-hidden={'true'}
      xmlns={'http://www.w3.org/2000/svg'}
      width={size}
      height={size}
      fill={'currentColor'}
      viewBox={`0 0 ${defaults.width} ${defaults.height}`}
    >
      <path
        d={
          'M17 4h-4V2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2ZM7 2h4v2H7V2Zm1 14a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v8Zm4 0a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v8Z'
        }
      />
    </svg>
  ) : (
    <svg
      name={`trash-bin-${variant}`}
      className={`w-[${size}px] h-[${size}px] text-gray-800 dark:text-white`}
      aria-hidden={'true'}
      xmlns={'http://www.w3.org/2000/svg'}
      width={size}
      height={size}
      fill={'none'}
      viewBox={`0 0 ${defaults.width} ${defaults.height}`}
    >
      <path
        stroke={'currentColor'}
        strokeLinecap={'round'}
        strokeLinejoin={'round'}
        strokeWidth={'2'}
        d={'M1 5h16M7 8v8m4-8v8M7 1h4a1 1 0 0 1 1 1v3H6V2a1 1 0 0 1 1-1ZM3 5h12v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5Z'}
      />
    </svg>
  )
}
