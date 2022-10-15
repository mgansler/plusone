import { useMutation, useQuery } from '@tanstack/react-query'
import type { BaseSyntheticEvent } from 'react'
import type { FallbackProps } from 'react-error-boundary'
import { useForm } from 'react-hook-form'

import type { DiscoverResponse } from '@plusone/feeds/shared/types'

import { useMutationFn, useQueryFn } from '../../util/api-client'

type NewFeedForm = {
  title: string
  url: string
  feedUrl: string
}

type NewFeedProps = {
  reloadFeeds: () => void
}

export function NewFeed({ reloadFeeds }: NewFeedProps) {
  const { register, handleSubmit, watch, reset } = useForm<NewFeedForm>()

  const addFeedMutationFn = useMutationFn('POST', 'api/feed')
  const { mutateAsync } = useMutation(['add-feed'], addFeedMutationFn, { useErrorBoundary: true })
  const discoverFeedQueryFn = useQueryFn('/api/feed/discover?url=')
  const { refetch: discover } = useQuery<DiscoverResponse>(['discover', watch('url')], discoverFeedQueryFn, {
    enabled: false,
  })

  const onSubmit = async (data: NewFeedForm, event?: BaseSyntheticEvent) => {
    if (((event?.nativeEvent as SubmitEvent).submitter as HTMLButtonElement).innerText === 'save') {
      await mutateAsync(data)
      await reloadFeeds()
    } else {
      const discoverResp = await discover()
      reset(discoverResp.data)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>
        Title
        <input type={'text'} aria-label={'title'} {...register('title')} />
      </label>
      <label>
        Url
        <input type={'text'} aria-label={'url'} {...register('url')} />
      </label>
      <label>
        Feed Url
        <input type={'text'} aria-label={'feed-url'} {...register('feedUrl')} />
      </label>
      <button>search</button>
      <button>save</button>
    </form>
  )
}

export function NewFeedFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div>
      Could not add feed: {error.message}
      <button onClick={resetErrorBoundary}>reset</button>
    </div>
  )
}
