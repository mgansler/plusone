import type { IconProps } from './defaults'
import { defaults } from './defaults'

export function Lightbulb({ variant, size = defaults.size }: IconProps) {
  console.log({ size })
  return variant === 'solid' ? (
    <svg
      name={`lightbulb-${variant}`}
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
          'M9.092 18h-4a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2Zm-2-18a7.009 7.009 0 0 0-7 7 7.8 7.8 0 0 0 2.219 5.123c.956 1.195 1.781 2.228 1.781 3.877a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1c0-1.7.822-2.7 1.774-3.868A7.63 7.63 0 0 0 14.092 7a7.009 7.009 0 0 0-7-7Zm0 5a2 2 0 0 0-2 2 1 1 0 0 1-2 0 4 4 0 0 1 4-4 1 1 0 0 1 0 2Z'
        }
      />
    </svg>
  ) : (
    <svg
      name={`lightbulb-${variant}`}
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
        d={'M4 7a3 3 0 0 1 3-3M5 19h4m0-3c0-4.1 4-4.9 4-9A6 6 0 1 0 1 7c0 4 4 5 4 9h4Z'}
      />
    </svg>
  )
}
