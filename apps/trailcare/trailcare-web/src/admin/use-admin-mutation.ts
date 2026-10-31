import { useQueryClient } from '@tanstack/react-query'

import { useUndo } from '../components/undo-toast'
import { errorMessage } from '../lib/api-error'

/** Refresh everything after an admin change and show errors as toast */
export function useAdminMutationOptions(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const { notifyError } = useUndo()
  return {
    mutation: {
      onSuccess: async () => {
        onSuccess?.()
        await queryClient.invalidateQueries()
      },
      onError: (error: unknown) => notifyError(errorMessage(error)),
    },
  }
}
