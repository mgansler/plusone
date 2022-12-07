import { Autocomplete, Button, Chip, Stack, TextField } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { getGetFeedTagsQueryKey, useGetFeedTags, useGetTags, useTagFeed, useUntagFeed } from '@plusone/feeds/api-client'
import type { TagResponseDto } from '@plusone/feeds/api-client'

type RemovableChipProps = {
  tag: TagResponseDto
}

function RemovableTag({ tag }: RemovableChipProps) {
  const { feedId } = useParams()

  const queryClient = useQueryClient()
  const { mutateAsync } = useUntagFeed({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(getGetFeedTagsQueryKey(feedId))
      },
    },
  })

  const handleUntag = async () => {
    await mutateAsync({ id: feedId, data: { tagId: tag.id } })
  }
  return <Chip label={tag.name} onDelete={handleUntag} />
}

type FeedTagsForm = {
  newTag: string
}

export function FeedTags() {
  const { feedId } = useParams()
  const { handleSubmit, register } = useForm<FeedTagsForm>()

  const { data: availableTags } = useGetTags()
  const { data: currentTags } = useGetFeedTags(feedId)

  const queryClient = useQueryClient()
  const { mutateAsync } = useTagFeed({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(getGetFeedTagsQueryKey(feedId))
      },
    },
  })

  const addableTags = useMemo(() => {
    return availableTags?.data.filter((tag) => !currentTags?.data.some((t) => t.id === tag.id)).map((t) => t.name)
  }, [availableTags?.data, currentTags?.data])

  const onSubmit = async (data: FeedTagsForm) => {
    const tag = availableTags.data.find((tag) => tag.name === data.newTag)
    if (tag) {
      await mutateAsync({ id: feedId, data: { tagId: tag.id } })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={2}>
        <Stack direction={'row'} spacing={1}>
          {currentTags?.data.map((tag) => (
            <RemovableTag key={tag.id} tag={tag} />
          ))}
        </Stack>
        <Autocomplete
          disablePortal={true}
          options={addableTags}
          renderInput={(params) => <TextField {...params} {...register('newTag')} />}
        />
        <Button type={'submit'}>Add</Button>
      </Stack>
    </form>
  )
}
