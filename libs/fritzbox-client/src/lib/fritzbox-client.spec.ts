import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import type { AvmServices } from './fritzbox-client'
import { FritzboxClient } from './fritzbox-client'
import { HostsService } from './services/hosts'
import { OnTelService } from './services/ontel'
import { TamService } from './services/tam'
import { Tr064 } from './tr064/tr064'

describe('fritzboxClient', () => {
  const server = setupServer()
  let fritzboxClient: FritzboxClient

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })

  afterAll(() => {
    server.close()
  })

  beforeEach(async () => {
    // @ts-expect-error incomplete mock
    vi.spyOn(Tr064, 'init').mockResolvedValue({})
    fritzboxClient = await FritzboxClient.init({ host: 'fritz-test.box', username: 'foo', password: 'bar' })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('authentication', () => {
    it('should login via old method', async () => {
      server.use(
        http.get('https://fritz-test.box/login_sid.lua', ({ request }) => {
          const url = new URL(request.url)
          if (
            url.searchParams.get('username') === 'foo' &&
            url.searchParams.get('response') === 'a1b2c3d4-5a00cde0ce3c3842d5f7e083a068f3a2'
          ) {
            return HttpResponse.xml(buildXmlResponse('0000000000000001', 'a1b2c3d4', 0))
          }
          return HttpResponse.xml(buildXmlResponse('0000000000000000', 'a1b2c3d4', 0))
        }),
      )

      await fritzboxClient.login()

      // @ts-expect-error sid is private
      expect(fritzboxClient.sid).toBe('0000000000000001')
    })

    it('should login via new method', async () => {
      server.use(
        http.get('https://fritz-test.box/login_sid.lua', () =>
          HttpResponse.xml(buildXmlResponse('0000000000000000', '2$60000$a1a1a1a1$6000$b2b2b2b2', 0)),
        ),
        http.post('https://fritz-test.box/login_sid.lua', async ({ request }) => {
          const formData = await request.formData()

          if (
            formData.get('username') === 'foo' &&
            formData.get('response') === 'b2b2b2b2$9af9072c5198e2d1cba4e1c38daf8369f0a5f11eafaa8a7c2d693eeab1fd1072'
          ) {
            return HttpResponse.xml(buildXmlResponse('0000000000000001', '2$60000$a1a1a1a1$6000$b2b2b2b2', 0))
          }

          return HttpResponse.xml(buildXmlResponse('0000000000000000', '2$60000$a1a1a1a1$6000$b2b2b2b2', 0))
        }),
      )

      await fritzboxClient.login()

      // @ts-expect-error sid is private
      expect(fritzboxClient.sid).toBe('0000000000000001')
    })

    it('should throw an error for invalid credentials', async () => {
      server.use(
        http.get('https://fritz-test.box/login_sid.lua', () =>
          HttpResponse.xml(buildXmlResponse('0000000000000000', '2$60000$a1a1a1a1$6000$b2b2b2b2', 0)),
        ),
        http.post('https://fritz-test.box/login_sid.lua', async () => {
          return HttpResponse.xml(buildXmlResponse('0000000000000000', '2$60000$a1a1a1a1$6000$b2b2b2b2', 0))
        }),
      )

      await expect(fritzboxClient.login()).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Could not get SID, check your credentials.]`,
      )
    })

    it('should throw an error when the client is blocked', async () => {
      server.use(
        http.get('https://fritz-test.box/login_sid.lua', () =>
          HttpResponse.xml(buildXmlResponse('0000000000000000', '2$60000$a1a1a1a1$6000$b2b2b2b2', 1)),
        ),
      )

      await expect(fritzboxClient.login()).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: You are blocked for 1 seconds, slow down!]`,
      )
    })
  })

  describe('services', () => {
    it.each([
      { name: 'hosts', type: HostsService },
      { name: 'tam', type: TamService },
      { name: 'onTel', type: OnTelService },
    ])(`with name $name should exist`, ({ name, type }) => {
      expect(fritzboxClient.tr064[name as keyof AvmServices]).toBeInstanceOf(type)
    })
  })
})

function buildXmlResponse(sid: string, challenge: string, blockTime: number) {
  return `<SessionInfo><SID>${sid}</SID><Challenge>${challenge}</Challenge><BlockTime>${blockTime}</BlockTime></SessionInfo>`
}
