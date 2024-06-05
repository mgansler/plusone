import { http, HttpResponse } from 'msw'

import { xmlBuilder } from '../services/shared'

import { authChallengeResponseSpec } from './auth-challenge-response.spec'

export const wancommonifconfigGetTotalBytesSentXmlSpec = http.post(
  'https://fritz-test.box:49443/upnp/control/wancommonifconfig1',
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
            'u:GetTotalBytesSentResponse': {
              NewTotalBytesSent: 2156315275,
              '@@xmlns:u': 'urn:dslforum-org:service:WANCommonInterfaceConfig:1',
            },
          },
          '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
          '@@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
        },
      }),
    )
  },
)
