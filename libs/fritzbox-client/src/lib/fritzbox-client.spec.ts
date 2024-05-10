import { http, HttpResponse } from 'msw'
import type { SetupServer } from 'msw/node'
import { setupServer } from 'msw/node'
import { afterEach, expect } from 'vitest'

import { OnTelService } from './avm/ontel'
import { TamService } from './avm/tam'
import type { AvmServices } from './fritzbox-client'
import { FritzboxClient } from './fritzbox-client'
import { Tr064 } from './tr064/tr064'

describe('fritzboxClient', () => {
  let server: SetupServer
  let fritzboxClient: FritzboxClient

  beforeEach(async () => {
    // @ts-expect-error incomplete mock
    vi.spyOn(Tr064, 'init').mockResolvedValue({})
    fritzboxClient = await FritzboxClient.init({ host: 'fritz-test.box', username: 'foo', password: 'bar' })
  })

  afterEach(() => {
    server.close()
    vi.restoreAllMocks()
  })

  describe('authentication', () => {
    it('should login via old method', async () => {
      server = setupServer(
        http.get('http://fritz-test.box/login_sid.lua', ({ request }) => {
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
      server.listen({ onUnhandledRequest: 'error' })

      await fritzboxClient.login()

      // @ts-expect-error sid is private
      expect(fritzboxClient.sid).toBe('0000000000000001')
    })

    it('should login via new method', async () => {
      server = setupServer(
        http.get('http://fritz-test.box/login_sid.lua', () =>
          HttpResponse.xml(buildXmlResponse('0000000000000000', '2$60000$a1a1a1a1$6000$b2b2b2b2', 0)),
        ),
        http.post('http://fritz-test.box/login_sid.lua', async ({ request }) => {
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
      server.listen({ onUnhandledRequest: 'error' })

      await fritzboxClient.login()

      // @ts-expect-error sid is private
      expect(fritzboxClient.sid).toBe('0000000000000001')
    })
  })

  describe('service', () => {
    it.each([
      { name: 'tam', type: TamService },
      { name: 'onTel', type: OnTelService },
    ])(`with name $name should exist`, ({ name, type }) => {
      expect(fritzboxClient.tr064[name as keyof AvmServices]).toBeInstanceOf(type)
    })
  })
})

function buildXmlResponse(sid: string, challenge: string, blockTime: number) {
  return `<SessionInfo><SID>${sid}</SID><Challenge>${challenge}</Challenge><BlockTime>${blockTime}</BlockTime></BlockTime></SessionInfo>`
}
