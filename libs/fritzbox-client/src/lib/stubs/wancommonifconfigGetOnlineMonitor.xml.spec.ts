import { http, HttpResponse } from 'msw'

import { xmlBuilder } from '../services/shared'

import { authChallengeResponseSpec } from './auth-challenge-response.spec'

export const wancommonifconfigGetOnlineMonitorXmlSpec = http.post(
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
            'u:X_AVM-DE_GetOnlineMonitorResponse': {
              NewTotalNumberSyncGroups: 2,
              NewSyncGroupName: 'sync_cable',
              NewSyncGroupMode: 'CABLE',
              Newmax_ds: 857938957,
              Newmax_us: 279624825,
              Newds_current_bps:
                '1711,2287,14023,2291,892,27713,27713,896,10582,2333,25519,15651,5088,6102,4115,2051,3267,1415,9443,3255',
              Newmc_current_bps: '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0',
              Newus_current_bps:
                '1159,15941,21526,6613,7000,2335,8631,17282,10624,1471,7749,21415,5955,8742,5296,4829,6447,1932,680,5685',
              Newprio_realtime_bps:
                '396,15174,20835,6281,6281,1478,6587,16180,9765,778,7097,20764,5322,6607,3596,4360,5676,1107,161,4966',
              Newprio_high_bps: '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0',
              Newprio_default_bps:
                '763,767,691,332,719,857,2044,1102,859,693,652,651,633,2135,1700,469,771,825,519,719',
              Newprio_low_bps: '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0',
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
