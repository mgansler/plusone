import { http, HttpResponse } from 'msw'

import { xmlBuilder } from '../services/shared'

export const deviceinfoXml = http.post('http://fritz-test.box:49000/upnp/control/deviceinfo', () => {
  return HttpResponse.xml(
    xmlBuilder.build({
      '?xml': {
        '@@version': '1.0',
      },
      's:Envelope': {
        's:Body': {
          'u:GetSecurityPortResponse': {
            NewSecurityPort: 49443,
            '@@xmlns:u': 'urn:dslforum-org:service:DeviceInfo:1',
          },
        },
        '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
        '@@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
      },
    }),
  )
})

export const deviceinfoXmlBrokenSecurityPort = http.post('http://fritz-test.box:49000/upnp/control/deviceinfo', () => {
  return HttpResponse.xml(
    xmlBuilder.build({
      '?xml': {
        '@@version': '1.0',
      },
      's:Envelope': {
        's:Body': {
          'u:GetSecurityPortResponse': {
            NewSecurityPortIsBroken: 49443,
            '@@xmlns:u': 'urn:dslforum-org:service:DeviceInfo:1',
          },
        },
        '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
        '@@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
      },
    }),
  )
})
