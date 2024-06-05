import { http, HttpResponse } from 'msw'

import { xmlBuilder } from '../../services/shared'
import { authChallengeResponseSpec } from '../auth-challenge-response.spec'

export const reauthenticateXmlSpec = http.post(
  'https://fritz-test.box:49443/upnp/control/x_contact',
  async ({ request }) => {
    const requestBodyText = await request.text()

    if (requestBodyText.includes('InitChallenge')) {
      return HttpResponse.xml(xmlBuilder.build(authChallengeResponseSpec))
    }

    if (requestBodyText.includes('c0751edabb37e9ca43ade3335497214c')) {
      return HttpResponse.xml(
        xmlBuilder.build({
          '?xml': { '@@version': '1.0' },
          's:Envelope': {
            's:Header': {
              'h:Challenge': {
                Status: 'Unauthenticated',
                Nonce: '8877665544332211',
                Realm: 'F!Box SOAP-Auth',
                '@@xmlns:h': 'http://soap-authentication.org/digest/2001/10/',
                '@@s:mustUnderstand': '1',
              },
            },
            's:Body': {},
            '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
            '@@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
          },
        }),
      )
    }

    if (requestBodyText.includes('0310f0c9e8bcdc5f1ee3b84a5173671a')) {
      return HttpResponse.xml(
        xmlBuilder.build({
          '?xml': { '@@version': '1.0' },
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
                NewCallListURL: 'https://fritz-test.box:49443/calllist.lua?sid=reauthenticated',
                '@@xmlns:u': 'urn:dslforum-org:service:X_AVM-DE_OnTel:1',
              },
            },
            '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
            '@@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
          },
        }),
      )
    }

    return new HttpResponse(null, { status: 401 })
  },
)

export const reauthenticateFailXmlSpec = http.post(
  'https://fritz-test.box:49443/upnp/control/x_contact',
  async ({ request }) => {
    const requestBodyText = await request.text()

    if (requestBodyText.includes('InitChallenge')) {
      return HttpResponse.xml(xmlBuilder.build(authChallengeResponseSpec))
    }

    return HttpResponse.xml(
      xmlBuilder.build({
        '?xml': { '@@version': '1.0' },
        's:Envelope': {
          's:Header': {
            'h:Challenge': {
              Status: 'Unauthenticated',
              Nonce: '8877665544332211',
              Realm: 'F!Box SOAP-Auth',
              '@@xmlns:h': 'http://soap-authentication.org/digest/2001/10/',
              '@@s:mustUnderstand': '1',
            },
          },
          's:Body': {},
          '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
          '@@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
        },
      }),
    )
  },
)
