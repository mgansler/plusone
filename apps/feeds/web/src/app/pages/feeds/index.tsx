import { useMutation, useQuery } from '@tanstack/react-query'
import type { BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'

import type { DiscoverResponse, FeedResponse } from '@plusone/feeds/shared/types'

import { useMutationFn, useQueryFn } from '../../util/api-client'

type NewFeedForm = {
  title: string
  url: string
  feedUrl: string
}

export function Feeds() {
  const { register, handleSubmit, watch, reset } = useForm<NewFeedForm>()
  const addFeedMutationFn = useMutationFn('POST', 'api/feed')
  const { mutateAsync } = useMutation(['add-feed'], addFeedMutationFn)
  const discoverFeedQueryFn = useQueryFn('/api/feed/discover?url=')
  const { refetch: discover } = useQuery<DiscoverResponse>(['discover', watch('url')], discoverFeedQueryFn, {
    enabled: false,
  })
  const fetchFeedListQueryFn = useQueryFn('/api/feed/')
  const { data } = useQuery<FeedResponse[]>(['feeds'], fetchFeedListQueryFn)

  const onSubmit = async (data: NewFeedForm, event?: BaseSyntheticEvent) => {
    if (((event?.nativeEvent as SubmitEvent).submitter as HTMLButtonElement).innerText === 'save') {
      await mutateAsync(data)
    } else {
      const discoverResp = await discover()
      reset(discoverResp.data)
    }
  }

  return (
    <div>
      Feeds
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>
          {' '}
          Title
          <input type={'text'} aria-label={'titel'} {...register('title')} />
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
      <div>
        {data?.map((feedResponse) => (
          <div key={feedResponse.id}>
            {feedResponse.title} - {feedResponse.originalTitle}
          </div>
        ))}
      </div>
    </div>
  )
}