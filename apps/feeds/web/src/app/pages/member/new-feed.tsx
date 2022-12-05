import { Button, Container, Divider, Link as MuiLink, Stack, TextField, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import type { FallbackProps } from 'react-error-boundary'
import { ErrorBoundary } from 'react-error-boundary'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import type { UseFormReset } from 'react-hook-form/dist/types/form'
import { Link, useNavigate } from 'react-router-dom'

import { getGetUserFeedsQueryKey, useAddFeed, useDiscoverFeed, useImportFeeds } from '@plusone/feeds/api-client'

type DiscoverFeedForm = {
  url: string
}

type NewFeedForm = {
  title: string
  feedUrl: string
}

type DiscoverFeedFormProps = {
  resetAddFeed: UseFormReset<NewFeedForm>
}

function DiscoverFeedForm({ resetAddFeed }: DiscoverFeedFormProps) {
  const { handleSubmit, register } = useForm<DiscoverFeedForm>()
  const { mutateAsync: discover } = useDiscoverFeed()

  const onDiscoverFeedSubmit = async (data: DiscoverFeedForm) => {
    const discoverResp = await discover({ params: data })
    resetAddFeed(discoverResp.data)
  }

  return (
    <form onSubmit={handleSubmit(onDiscoverFeedSubmit)}>
      <Stack spacing={2}>
        <Typography>Discover</Typography>
        <TextField fullWidth={true} label={'url'} {...register('url')} />
        <Button type={'submit'}>search</Button>
      </Stack>
    </form>
  )
}

type AddFeedFormProps = {
  methods: UseFormReturn<NewFeedForm>
}

function AddFeedForm({ methods: { register, handleSubmit } }: AddFeedFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { mutateAsync } = useAddFeed({
    mutation: {
      useErrorBoundary: true,
      onMutate: () => queryClient.invalidateQueries(getGetUserFeedsQueryKey()),
    },
  })

  const onAddFeedSubmit = async (data: NewFeedForm) => {
    await mutateAsync({ data })
    navigate('../feeds')
  }

  return (
    <form onSubmit={handleSubmit(onAddFeedSubmit)}>
      <Stack spacing={2}>
        <Typography>Add manually</Typography>
        <TextField fullWidth={true} label={'title'} {...register('title')} />
        <TextField fullWidth={true} label={'feed-url'} {...register('feedUrl')} />
        <Button type={'submit'}>save</Button>
      </Stack>
    </form>
  )
}

type ImportFormForm = {
  feeds: string
}

function ImportForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { register, handleSubmit } = useForm<ImportFormForm>()
  const { mutateAsync } = useImportFeeds({
    mutation: { onSuccess: () => queryClient.invalidateQueries(getGetUserFeedsQueryKey()) },
  })

  const onSubmit = async (data: ImportFormForm) => {
    const feeds = JSON.parse('[' + data.feeds + ']')
    await mutateAsync({ data: feeds })
    navigate('../feeds')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Typography>Import list of feeds</Typography>
        <TextField
          fullWidth={true}
          multiline={true}
          minRows={5}
          label={'import'}
          {...register('feeds', {
            validate: async (value) => {
              try {
                JSON.parse('[' + value + ']')
                return true
              } catch (e) {
                return false
              }
            },
          })}
        />
        <Button type={'submit'}>import</Button>
      </Stack>
    </form>
  )
}

function NewFeedFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div>
      Could not add feed: {error.message}
      <Button onClick={resetErrorBoundary}>reset</Button>
    </div>
  )
}

export function NewFeed() {
  const addFeedMethods = useForm<NewFeedForm>()

  return (
    <ErrorBoundary FallbackComponent={NewFeedFallback} onReset={() => addFeedMethods.reset()}>
      <MuiLink component={Link} to={'../feeds'}>
        back
      </MuiLink>

      <Container maxWidth={'sm'}>
        <DiscoverFeedForm resetAddFeed={addFeedMethods.reset} />
      </Container>

      <Divider />

      <Container maxWidth={'sm'}>
        <AddFeedForm methods={addFeedMethods} />
      </Container>

      <Divider />

      <Container maxWidth={'sm'}>
        <ImportForm />
      </Container>
    </ErrorBoundary>
  )
}
