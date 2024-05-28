import { http, HttpResponse } from 'msw'

import { xmlBuilder } from '../avm/shared'

import { authChallengeResponseSpec } from './auth-challenge-response.spec'

export const x_contactGetCallListXmlSpec = http.post(
  'https://fritz-test.box:49443/upnp/control/x_contact',
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
            'u:GetCallListResponse': {
              NewCallListURL: 'https://fritz-test.box:49443/calllist.lua?sid=deadbeef12345678',
              '@@xmlns:u': 'urn:dslforum-org:service:X_AVM-DE_OnTel:1',
            },
          },
          '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
          '@@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
        },
      }),
    )
  },
)

export const x_contactCallList_oneEntry = http.get('https://fritz-test.box:49443/calllist.lua', () => {
  return HttpResponse.xml(
    xmlBuilder.build({
      '?xml': {
        '@@version': '1.0',
        '@@encoding': 'UTF-8',
      },
      root: {
        timestamp: 220,
        Call: {
          Id: 1,
          Type: 1,
          Caller: 987654321,
          Called: 'SIP: 123456789',
          CalledNumber: 123456789,
          Name: 'Somebody I know',
          Numbertype: 'sip',
          Device: 'FRITZ!Fon C5',
          Port: 10,
          Date: '24.12.00 00:00',
          Duration: '0:05',
          Count: '',
          Path: '',
        },
      },
    }),
  )
})

export const x_contactCallList_twoEntries = http.get('https://fritz-test.box:49443/calllist.lua', () => {
  return HttpResponse.xml(
    xmlBuilder.build({
      '?xml': {
        '@@version': '1.0',
        '@@encoding': 'UTF-8',
      },
      root: {
        timestamp: 220,
        Call: [
          {
            Id: 2,
            Type: 1,
            Caller: 987654321,
            Called: 'SIP: 123456789',
            CalledNumber: 123456789,
            Name: 'Somebody I know',
            Numbertype: 'sip',
            Device: 'FRITZ!Fon C5',
            Port: 10,
            Date: '24.12.00 00:00',
            Duration: '0:05',
            Count: '',
            Path: '',
          },
          {
            Id: 1,
            Type: 2,
            Caller: 987654321,
            Called: 'SIP: 123456789',
            CalledNumber: 123456789,
            Name: '',
            Numbertype: 'sip',
            Device: '',
            Port: -1,
            Date: '23.12.00 00:00',
            Duration: '0:00',
            Count: '',
            Path: '',
          },
        ],
      },
    }),
  )
})
