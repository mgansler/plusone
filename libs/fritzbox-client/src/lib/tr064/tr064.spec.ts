import type { SetupServer } from 'msw/node'
import { setupServer } from 'msw/node'
import { afterEach, beforeEach, expect } from 'vitest'

import { deviceinfoXml } from '../avm/stubs/deviceinfo.xml.spec'
import { tr64descXmlSpec } from '../avm/stubs/tr64desc.xml.spec'
import { x_contactSCPDXmlSpec } from '../avm/stubs/x_contactSCPD.xml.spec'
import { x_tamSCPDXmlSpec } from '../avm/stubs/x_tamSCPD.xml.spec'

import { Tr064 } from './tr064'

describe('tr064', () => {
  let server: SetupServer
  let tr064: Tr064

  beforeEach(async () => {
    server = setupServer(tr64descXmlSpec, deviceinfoXml, x_contactSCPDXmlSpec, x_tamSCPDXmlSpec)

    server.listen({ onUnhandledRequest: 'error' })
    tr064 = await Tr064.init({ host: 'fritz-test.box', username: 'admin', password: 'gurkensalat' })
  })

  afterEach(() => {
    server.close()
  })

  it('should negotiate the security port', () => {
    // @ts-expect-error axiosInstance is a private property
    expect(tr064.axiosInstance.defaults.baseURL).toBe('https://fritz-test.box:49443')
  })

  it('should calculate the authentication response', () => {
    // @ts-expect-error method is private
    const actual = tr064.calcAuthDigest('F!Box SOAP-Auth', 'F758BE72FB999CEA')

    expect(actual).toBe('b4f67585f22b0af7c4615db5a18faa14')
  })
})
