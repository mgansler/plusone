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
      <label>
        Url
        <input type={'text'} aria-label={'url'} {...register('url')} />
      </label>
      <button>search</button>
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
      <label>
        Title
        <input type={'text'} aria-label={'title'} {...register('title')} />
      </label>
      <label>
        Feed Url
        <input type={'text'} aria-label={'feed-url'} {...register('feedUrl')} />
      </label>
      <button>save</button>
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
      <label>
        Import
        <textarea
          aria-label={'import'}
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
      </label>
      <button>import</button>
    </form>
  )
}

function NewFeedFallback({ error, resetErrorBoundary }: FallbackProps) {
  console.log(error)
  return (
    <div>
      Could not add feed: {error.message}
      <button onClick={resetErrorBoundary}>reset</button>
    </div>
  )
}

export function NewFeed() {
  const addFeedMethods = useForm<NewFeedForm>()

  return (
    <ErrorBoundary FallbackComponent={NewFeedFallback} onReset={() => addFeedMethods.reset()}>
      <Link to={'../feeds'}>back</Link>
      <DiscoverFeedForm resetAddFeed={addFeedMethods.reset} />
      <AddFeedForm methods={addFeedMethods} />
      <ImportForm />
    </ErrorBoundary>
  )
}
