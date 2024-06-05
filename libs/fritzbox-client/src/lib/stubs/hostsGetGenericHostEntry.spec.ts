import { http, HttpResponse } from 'msw'

import { xmlBuilder } from '../services/shared'

export const hostsGetGenericHostEntrySpec = http.post('https://fritz-test.box:49443/upnp/control/hosts', () => {
  return HttpResponse.xml(
    xmlBuilder.build({
      '?xml': {
        '@@version': '1.0',
      },
      's:Envelope': {
        's:Body': {
          'u:GetGenericHostEntryResponse': {
            NewIPAddress: '192.168.178.1',
            NewAddressSource: 'DHCP',
            NewLeaseTimeRemaining: 0,
            NewMACAddress: 'MA:CA:DD:RE:SS:00',
            NewInterfaceType: 'Ethernet',
            NewActive: 1,
            NewHostName: 'fritz.box',
            '@@xmlns:u': 'urn:dslforum-org:service:Hosts:1',
          },
        },
        '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
        '@@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
      },
    }),
  )
})
