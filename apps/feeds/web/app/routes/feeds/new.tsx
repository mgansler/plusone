import type { ActionFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { useActionData } from '@remix-run/react'

import { baseUrl } from '../../entry.server'
import { getUserSession } from '../../utils/session.server'

type ActionResponse = {
  title: string
  feedUrl: string
  url: string
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const session = await getUserSession(request)

  const url = form.get('url')
  const feedUrl = form.get('feedUrl')
  const title = form.get('title')

  if (feedUrl && title) {
    const created = await fetch(`${baseUrl}/feed/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${session.get('token')}`,
      },
      body: JSON.stringify({ title, url, feedUrl }),
    })

    if (created.status === 201) {
      return redirect('/feeds')
    }

    // TODO: handle errors
  }

  const discovered = await fetch(`${baseUrl}/feed/discover?url=${url}`, {
    headers: {
      Authorization: `bearer ${session.get('token')}`,
    },
  })

  // TODO: there may be errors?
  return discovered.json()
}

export default function () {
  const result = useActionData<ActionResponse>()

  return (
    <form method={'post'} className={'flex flex-col'}>
      <input type={'url'} name={'url'} defaultValue={result?.url} />
      <input type={'url'} name={'feedUrl'} defaultValue={result?.feedUrl} />
      <input type={'text'} name={'title'} defaultValue={result?.title} />
      <button type={'submit'}>{result ? 'Create' : 'Find'}</button>
    </form>
  )
}
