import { Button, Chip, Container, Divider, Link as MuiLink, Stack, TextField } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { getGetTagsQueryKey, useAddTag, useGetTags, useRemoveTag } from '@plusone/feeds/api-client'
import type { AddTagMutationBody, TagResponseDto } from '@plusone/feeds/api-client'

function AddTag() {
  const { register, handleSubmit, formState } = useForm<AddTagMutationBody>()

  const queryClient = useQueryClient()
  const { mutateAsync } = useAddTag({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(getGetTagsQueryKey())
      },
    },
  })
  const { data: currentTags } = useGetTags()

  const onSubmit = async (data: AddTagMutationBody) => {
    await mutateAsync({ data })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={1}>
        <TextField
          label={'Tag Name'}
          {...register('name', {
            validate: (value) => {
              if (value.length === 0) {
                return "Tag can't be empty."
              }
              if (currentTags?.data.map((tag) => tag.name).includes(value)) {
                return 'This tag already exists.'
              }
              return true
            },
          })}
          error={typeof formState.errors.name !== 'undefined'}
          helperText={formState.errors.name?.message}
        />
        <Button type={'submit'}>Add new Tag</Button>
      </Stack>
    </form>
  )
}

type TagChipProps = {
  tag: TagResponseDto
}

function TagChip({ tag }: TagChipProps) {
  const queryClient = useQueryClient()
  const { mutateAsync } = useRemoveTag({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(getGetTagsQueryKey())
      },
    },
  })

  const handleDelete = async () => {
    await mutateAsync({ id: tag.id })
  }
  return <Chip label={tag.name} onDelete={handleDelete} />
}

export function Tags() {
  const { data } = useGetTags()

  return (
    <Container maxWidth={'md'}>
      <Stack gap={2}>
        <MuiLink component={Link} to={'../feeds'}>
          back
        </MuiLink>
        <Divider />
        <Stack direction={'row'} spacing={1}>
          {data?.data.map((tag) => (
            <TagChip key={tag.id} tag={tag} />
          ))}
        </Stack>
        <Divider />
        <AddTag />
      </Stack>
    </Container>
  )
}
