export const FROSTED_GLASS_FILTER_ID = 'frosted-glass'

export function FrostedGlassFilter() {
  return (
    <filter id={FROSTED_GLASS_FILTER_ID} x={0} y={0}>
      <feGaussianBlur in={'SourceGraphic'} stdDeviation={5} result={'blur'} />
      <feColorMatrix
        in="blur"
        mode="matrix"
        values="1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        0 0 0 0.6 0"
        result="blured"
      />
    </filter>
  )
}
