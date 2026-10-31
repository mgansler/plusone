import { getGetSessionQueryKey, getGetTrailAreasQueryKey } from '@plusone/trailcare-api-client'

import { httpError } from '../test/fake-api'
import { USER } from '../test/fixtures'

import { createQueryClient } from './query-client'

describe('createQueryClient', () => {
  async function failQuery(error: unknown) {
    const queryClient = createQueryClient()
    queryClient.setQueryData(getGetSessionQueryKey(), USER)
    await queryClient
      .fetchQuery({ queryKey: getGetTrailAreasQueryKey(), queryFn: () => Promise.reject(error) })
      .catch(() => undefined)
    return queryClient.getQueryData(getGetSessionQueryKey())
  }

  it('logs out when the session ended', async () => {
    expect(await failQuery(httpError(401, undefined, '/api/trail-areas'))).toEqual({ authenticated: false })
  })

  it('stays logged in on other errors', async () => {
    expect(await failQuery(httpError(500, undefined, '/api/trail-areas'))).toEqual(USER)
    expect(await failQuery(httpError(403, undefined, '/api/admin/access-passwords'))).toEqual(USER)
  })

  it('ignores 401 from the login itself', async () => {
    expect(await failQuery(httpError(401, 'Falsches Passwort', '/api/auth/login'))).toEqual(USER)
  })

  it('also reacts to failed mutations', async () => {
    const queryClient = createQueryClient()
    queryClient.setQueryData(getGetSessionQueryKey(), USER)
    await queryClient
      .getMutationCache()
      .build(queryClient, { mutationFn: () => Promise.reject(httpError(401, undefined, '/api/trails/1/care-entries')) })
      .execute(undefined)
      .catch(() => undefined)
    expect(queryClient.getQueryData(getGetSessionQueryKey())).toEqual({ authenticated: false })
  })
})
