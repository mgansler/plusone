import type { BaseSyntheticEvent } from 'react'
import type { FallbackProps } from 'react-error-boundary'
import { useForm } from 'react-hook-form'

import { useFeedControllerAdd, useFeedControllerDiscover } from '@plusone/feeds/api-client'

type NewFeedForm = {
  title: string
  url: string
  feedUrl: string
}

type NewFeedProps = {
  reloadFeeds: () => void
}

export function NewFeed({ reloadFeeds }: NewFeedProps) {
  const { register, handleSubmit, reset } = useForm<NewFeedForm>()

  const { mutateAsync: addFeed } = useFeedControllerAdd({ mutation: { useErrorBoundary: true } })
  const { mutateAsync: discover } = useFeedControllerDiscover()

  const onSubmit = async (data: NewFeedForm, event?: BaseSyntheticEvent) => {
    if (((event?.nativeEvent as SubmitEvent).submitter as HTMLButtonElement).innerText === 'save') {
      await addFeed({ data })
      await reloadFeeds()
    } else {
      const discoverResp = await discover({ params: data })
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
  console.log(error)
  return (
    <div>
      Could not add feed: {error.message}
      <button onClick={resetErrorBoundary}>reset</button>
    </div>
  )
}
