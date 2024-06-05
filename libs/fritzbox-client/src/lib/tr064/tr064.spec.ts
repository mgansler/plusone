import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { beforeEach, expect } from 'vitest'

import { xmlBuilder } from '../services/shared'
import { reauthenticateFailXmlSpec, reauthenticateXmlSpec } from '../stubs/custom/reauthenticate.xml.spec'
import { deviceinfoXml, deviceinfoXmlBrokenSecurityPort } from '../stubs/deviceinfo.xml.spec'
import { hostsXmlSpec } from '../stubs/hosts.xml.spec'
import { tr64descXmlSpec } from '../stubs/tr64desc.xml.spec'
import { wancommonifconfigSCPDXmlSpec } from '../stubs/wancommonifconfigSCPD.xml.spec'
import { x_contactSCPDXmlSpec } from '../stubs/x_contactSCPD.xml.spec'
import { x_tamSCPDXmlSpec } from '../stubs/x_tamSCPD.xml.spec'

import { Tr064 } from './tr064'

describe('tr064', () => {
  const server = setupServer()
  let tr064: Tr064

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })

  afterAll(() => {
    server.close()
  })

  describe('successful init', () => {
    beforeEach(async () => {
      server.use(
        tr64descXmlSpec,
        deviceinfoXml,
        hostsXmlSpec,
        wancommonifconfigSCPDXmlSpec,
        x_contactSCPDXmlSpec,
        x_tamSCPDXmlSpec,
      )

      tr064 = await Tr064.init({ host: 'fritz-test.box', username: 'admin', password: 'gurkensalat' })
    })

    it('should negotiate the security port', () => {
      // @ts-expect-error axiosInstance is a private property
      expect(tr064.axiosInstance.defaults.baseURL).toBe('https://fritz-test.box:49443')
    })

    it('should calculate the authentication response', () => {
      // @ts-expect-error calcAuthDigest is a private method
      const actual = tr064.calcAuthDigest('F!Box SOAP-Auth', 'F758BE72FB999CEA')

      expect(actual).toBe('b4f67585f22b0af7c4615db5a18faa14')
    })

    it('should try to re-authenticate', async () => {
      server.use(reauthenticateXmlSpec)

      const result = await tr064.callAction('urn:dslforum-org:service:X_AVM-DE_OnTel:1', 'GetCallList')

      expect(result['NewCallListURL']).toBe('https://fritz-test.box:49443/calllist.lua?sid=reauthenticated')
    })

    it('should fail to re-authenticate', async () => {
      server.use(reauthenticateFailXmlSpec)

      await expect(
        tr064.callAction('urn:dslforum-org:service:X_AVM-DE_OnTel:1', 'GetCallList', {}, true),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Re-Authentication failed.]`)

      expect(tr064.authParams).toBe(undefined)
    })

    it('should throw an error for unknown service', async () => {
      await expect(tr064.callAction('unknown-service', 'action-name')).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: No service of type 'unknown-service' found.]`,
      )
    })

    it('should throw an error for unknown action', async () => {
      await expect(
        tr064.callAction('urn:dslforum-org:service:X_AVM-DE_TAM:1', 'ActionDoesNotExist'),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Action named 'ActionDoesNotExist' does not exist in service 'urn:dslforum-org:service:X_AVM-DE_TAM:1'.]`,
      )
    })

    it('should reject a call with missing inArgs', async () => {
      await expect(
        tr064.callAction('urn:dslforum-org:service:X_AVM-DE_TAM:1', 'GetMessageList'),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Missing required inArg 'NewIndex'.]`)
    })

    it('should throw an error when call fails', async () => {
      server.use(
        http.post('https://fritz-test.box:49443/upnp/control/x_tam', () => {
          return new HttpResponse(null, { status: 404 })
        }),
      )

      await expect(
        tr064.callAction('urn:dslforum-org:service:X_AVM-DE_TAM:1', 'GetMessageList', { NewIndex: '1' }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[AxiosError: Request failed with status code 404]`)
    })

    it('should throw an error when initial response does not contain a challenge', async () => {
      server.use(
        http.post('https://fritz-test.box:49443/upnp/control/x_tam', () => {
          return HttpResponse.xml(
            xmlBuilder.build({
              '?xml': {
                '@@version': '1.0',
              },
              's:Envelope': {
                's:Header': {},
                's:Body': {},
                '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
                '@@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
              },
            }),
          )
        }),
      )

      await expect(
        tr064.callAction('urn:dslforum-org:service:X_AVM-DE_TAM:1', 'GetMessageList', { NewIndex: '1' }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Initial response contained no challenge, something went wrong.]`,
      )
    })
  })

  it('should fail to init due to invalid security port response', async () => {
    server.use(tr64descXmlSpec, deviceinfoXmlBrokenSecurityPort)

    await expect(
      Tr064.init({
        host: 'fritz-test.box',
        username: 'admin',
        password: 'gurkensalat',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Failed to retrieve security port.]`)
  })
})
