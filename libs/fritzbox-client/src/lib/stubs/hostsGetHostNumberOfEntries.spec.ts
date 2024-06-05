import { http, HttpResponse } from 'msw'

import { xmlBuilder } from '../services/shared'

export const hostsGetHostNumberOfEntriesSpec = http.post('https://fritz-test.box:49443/upnp/control/hosts', () => {
  return HttpResponse.xml(
    xmlBuilder.build({
      '?xml': {
        '@@version': '1.0',
      },
      's:Envelope': {
        's:Body': {
          'u:GetHostNumberOfEntriesResponse': {
            NewHostNumberOfEntries: 42,
            '@@xmlns:u': 'urn:dslforum-org:service:Hosts:1',
          },
        },
        '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
        '@@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
      },
    }),
  )
})
