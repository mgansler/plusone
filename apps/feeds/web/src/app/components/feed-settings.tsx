import {
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Link as MuiLink,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'

import { Sort } from '@plusone/feeds/shared/types'
import { getGetUserFeedsQueryKey, useGetFeedSettings, useUpdateFeedSettings } from '@plusone/feeds/api-client'
import type { UpdateFeedSettingsMutationBody } from '@plusone/feeds/api-client'

type FeedSettingsForm = UpdateFeedSettingsMutationBody

export function FeedSettings() {
  const { feedId } = useParams()
  const { reset, register, handleSubmit } = useForm<FeedSettingsForm>()

  const { data: currentSettings, isFetching } = useGetFeedSettings(feedId)
  useEffect(() => {
    if (currentSettings?.data) {
      reset(currentSettings.data)
    }
  }, [currentSettings?.data, reset])

  const queryClient = useQueryClient()
  const { mutateAsync } = useUpdateFeedSettings({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(getGetUserFeedsQueryKey())
      },
    },
  })

  const onSubmit = async (data: FeedSettingsForm) => {
    await mutateAsync({ id: feedId, data })
  }

  if (isFetching) {
    return null
  }

  return (
    <Container maxWidth={'sm'} key={feedId}>
      <Stack gap={2}>
        <MuiLink to={`../${feedId}`} component={Link}>
          Close
        </MuiLink>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={2}>
            <TextField
              aria-readonly={true}
              disabled={true}
              label={'Feed Id'}
              value={currentSettings?.data.id}
            ></TextField>

            <TextField label={'Feed Title'} {...register('title')}></TextField>

            <TextField label={'Order'} select={true} defaultValue={currentSettings?.data.order} {...register('order')}>
              <MenuItem value={Sort.OldestFirst}>Oldest First</MenuItem>
              <MenuItem value={Sort.NewestFirst}>Newest First</MenuItem>
            </TextField>

            <FormControlLabel
              control={<Checkbox defaultChecked={currentSettings?.data.includeRead} {...register('includeRead')} />}
              label={'Include Read'}
            />

            <FormControlLabel
              control={<Checkbox defaultChecked={currentSettings?.data.expandContent} {...register('expandContent')} />}
              label={'Expand Content'}
            />

            <Button type={'submit'}>Save</Button>
          </Stack>
        </form>
      </Stack>
    </Container>
  )
}
