import { useQueryClient } from '@tanstack/react-query'

import type { CreateCareEntryDto } from '@plusone/trailcare-api-client'
import { CareType, useCreateCareEntry } from '@plusone/trailcare-api-client'

import { useUndo } from '../components/undo-toast'

import { errorMessage } from './api-error'
import { CARE_TYPE_DONE } from './care-types'

/** Create a care log entry, refresh all trail data and offer undo */
export function useRecordCare(trailId: number, trailName: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const { confirm, notifyError } = useUndo()

  const mutation = useCreateCareEntry({
    mutation: {
      onSuccess: async (entry) => {
        confirm(`${CARE_TYPE_DONE[entry.type]}: ${trailName}`, entry)
        onSuccess?.()
        await queryClient.invalidateQueries()
      },
      onError: (error) => notifyError(errorMessage(error)),
    },
  })

  return {
    ...mutation,
    record: (data: CreateCareEntryDto) => mutation.mutate({ trailId, data }),
    sweepNow: () => mutation.mutate({ trailId, data: { type: CareType.SWEPT } }),
  }
}
