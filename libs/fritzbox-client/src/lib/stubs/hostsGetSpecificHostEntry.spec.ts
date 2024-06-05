import { http, HttpResponse } from 'msw'

import { xmlBuilder } from '../services/shared'

import { authChallengeResponseSpec } from './auth-challenge-response.spec'

export const hostsGetSpecificHostEntrySpec = http.post(
  'https://fritz-test.box:49443/upnp/control/hosts',
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
            'u:X_AVM-DE_GetSpecificHostEntryByIPResponse': {
              NewMACAddress: 'MA:CA:DD:RE:SS:00',
              NewActive: 1,
              NewHostName: 'fritz.box',
              NewInterfaceType: '',
              'NewX_AVM-DE_Port': 0,
              'NewX_AVM-DE_Speed': 0,
              'NewX_AVM-DE_UpdateAvailable': 0,
              'NewX_AVM-DE_UpdateSuccessful': 'unknown',
              'NewX_AVM-DE_InfoURL': '',
              'NewX_AVM-DE_MACAddressList': 'MA:CA:DD:RE:SS:00,MA:CA:DD:RE:SS:01',
              'NewX_AVM-DE_Model': '',
              'NewX_AVM-DE_URL': 'http://192.168.178.1',
              'NewX_AVM-DE_Guest': 0,
              'NewX_AVM-DE_RequestClient': 0,
              'NewX_AVM-DE_VPN': 0,
              'NewX_AVM-DE_WANAccess': 'granted',
              'NewX_AVM-DE_Disallow': 0,
              'NewX_AVM-DE_IsMeshable': 1,
              'NewX_AVM-DE_Priority': 0,
              'NewX_AVM-DE_FriendlyName': 'fritz.box',
              'NewX_AVM-DE_FriendlyNameIsWriteable': 0,
              '@@xmlns:u': 'urn:dslforum-org:service:Hosts:1',
            },
          },
          '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
          '@@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
        },
      }),
    )
  },
)
