import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'

import type { useValidatedTrailAreas } from '@plusone/stgtrails-api-client'

export function useTrailAreaId(
  trailAreas: ReturnType<typeof useValidatedTrailAreas>['data'],
): [trailAreaId: number | undefined, Dispatch<SetStateAction<number | undefined>>] {
  const [trailAreaId, setTrailAreaId] = useState<number>()

  useEffect(() => {
    if (
      // prettier-ignore
      // when trailAreas have been loaded
      trailAreas && trailAreas.length > 0 &&
      // and trailAreaId is unset
      (typeof trailAreaId !== 'number' ||
        // or previous selected trailAreaId is not in current list
        trailAreas.find((area) => area.id === trailAreaId) === undefined)
    ) {
      setTrailAreaId(trailAreas[0].id)
    }
  }, [trailAreas, trailAreaId])

  return [trailAreaId, setTrailAreaId]
}
