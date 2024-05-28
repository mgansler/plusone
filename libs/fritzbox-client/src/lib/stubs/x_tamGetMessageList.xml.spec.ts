import { http, HttpResponse } from 'msw'

import { xmlBuilder } from '../avm/shared'

import { authChallengeResponseSpec } from './auth-challenge-response.spec'

export const x_tamGetMessageListXmlSpec = http.post(
  'https://fritz-test.box:49443/upnp/control/x_tam',
  async ({ request }) => {
    if ((await request.text()).includes('InitChallenge')) {
      return HttpResponse.xml(xmlBuilder.build(authChallengeResponseSpec))
    }
    return HttpResponse.xml(
      xmlBuilder.build({
        '?xml': {
          '@@version': '1.0',
        },
        's:Envelope': {
          's:Header': {
            'h:NextChallenge': {
              Status: 'Authenticated',
              Nonce: '1122334455667788',
              Realm: 'F!Box SOAP-Auth',
              '@@xmlns:h': 'http://soap-authentication.org/digest/2001/10/',
              '@@s:mustUnderstand': '1',
            },
          },
          's:Body': {
            'u:GetMessageListResponse': {
              NewURL: 'https://fritz-test.box:49443/tamcalllist.lua?sid=deadbeef12345678&tamindex=0',
              '@@xmlns:u': 'urn:dslforum-org:service:X_AVM-DE_TAM:1',
            },
          },
          '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
          '@@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
        },
      }),
    )
  },
)

export const x_tamMessageList_oneEntry = http.get('https://fritz-test.box:49443/tamcalllist.lua', () => {
  return HttpResponse.xml(
    xmlBuilder.build({
      '?xml': {
        '@@version': '1.0',
        '@@encoding': 'UTF-8',
      },
      Root: {
        Message: {
          Index: 0,
          Tam: 0,
          Called: 123456789,
          Date: '23.12.00 00:00',
          Duration: '0:01',
          Inbook: 1,
          Name: 'Somebody I know',
          New: 0,
          Number: 987654321,
          Path: '/download.lua?path=/data/tam/rec/rec.0.000',
        },
      },
    }),
  )
})

export const x_tamMessageList_twoEntries = http.get('https://fritz-test.box:49443/tamcalllist.lua', () => {
  return HttpResponse.xml(
    xmlBuilder.build({
      '?xml': {
        '@@version': '1.0',
        '@@encoding': 'UTF-8',
      },
      Root: {
        Message: [
          {
            Index: 1,
            Tam: 0,
            Called: 123456789,
            Date: '24.12.00 00:00',
            Duration: '0:01',
            Inbook: 0,
            Name: '',
            New: 1,
            Number: 987654321,
            Path: '/download.lua?path=/data/tam/rec/rec.0.001',
          },
          {
            Index: 0,
            Tam: 0,
            Called: 123456789,
            Date: '23.12.00 00:00',
            Duration: '0:01',
            Inbook: 1,
            Name: 'Somebody I know',
            New: 0,
            Number: 987654321,
            Path: '/download.lua?path=/data/tam/rec/rec.0.000',
          },
        ],
      },
    }),
  )
})
