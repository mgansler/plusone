import { Button, Checkbox, FormControlLabel, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import {
  getGetUserFeedsQueryKey,
  Sort,
  useUpdateFeedSettings,
  useValidatedGetFeedSettings,
} from '@plusone/feeds/api-client'
import type { UpdateFeedSettingsMutationBody } from '@plusone/feeds/api-client'

type FeedSettingsForm = UpdateFeedSettingsMutationBody

export function FeedSettings() {
  const { feedId } = useParams()

  const { data: currentSettings, isFetching, refetch } = useValidatedGetFeedSettings(feedId)

  const queryClient = useQueryClient()
  const { mutateAsync } = useUpdateFeedSettings({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getGetUserFeedsQueryKey() })
      },
    },
  })

  const { register, handleSubmit } = useForm<FeedSettingsForm>({
    defaultValues: async () => {
      try {
        const response = await refetch()
        return response.data as FeedSettingsForm
      } catch (e) {
        console.error('Could not get current feed settings', e)
        return {
          disabled: false,
          expandContent: false,
          includeRead: true,
          order: Sort.desc,
        }
      }
    },
  })

  const onSubmit = async (data: FeedSettingsForm) => {
    await mutateAsync({ id: feedId, data })
  }

  if (isFetching) {
    return null
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={2}>
        <Typography>Feed Settings</Typography>

        <TextField aria-readonly={true} disabled={true} label={'Feed Id'} value={currentSettings?.id} />

        <TextField label={'Feed Title'} {...register('title')} />

        <TextField label={'Order'} select={true} defaultValue={currentSettings?.order} {...register('order')}>
          <MenuItem value={Sort.asc}>Oldest First</MenuItem>
          <MenuItem value={Sort.desc}>Newest First</MenuItem>
        </TextField>

        <FormControlLabel
          control={<Checkbox defaultChecked={currentSettings?.includeRead} {...register('includeRead')} />}
          label={'Include Read'}
        />

        <FormControlLabel
          control={<Checkbox defaultChecked={currentSettings?.expandContent} {...register('expandContent')} />}
          label={'Expand Content'}
        />

        <FormControlLabel
          control={<Checkbox defaultChecked={currentSettings?.disabled} {...register('disabled')} />}
          label={'Disabled'}
        />

        <Button type={'submit'}>Save</Button>
      </Stack>
    </form>
  )
}
