import { http, HttpResponse } from 'msw'

import { xmlBuilder } from '../services/shared'

export const hostsXmlSpec = http.get('https://fritz-test.box:49443/hostsSCPD.xml', () => {
  return HttpResponse.xml(
    xmlBuilder.build({
      '?xml': {
        '@@version': '1.0',
      },
      scpd: {
        specVersion: {
          major: 1,
          minor: 0,
        },
        actionList: {
          action: [
            {
              name: 'GetHostNumberOfEntries',
              argumentList: {
                argument: {
                  name: 'NewHostNumberOfEntries',
                  direction: 'out',
                  relatedStateVariable: 'HostNumberOfEntries',
                },
              },
            },
            {
              name: 'GetSpecificHostEntry',
              argumentList: {
                argument: [
                  {
                    name: 'NewMACAddress',
                    direction: 'in',
                    relatedStateVariable: 'MACAddress',
                  },
                  {
                    name: 'NewIPAddress',
                    direction: 'out',
                    relatedStateVariable: 'IPAddress',
                  },
                  {
                    name: 'NewAddressSource',
                    direction: 'out',
                    relatedStateVariable: 'AddressSource',
                  },
                  {
                    name: 'NewLeaseTimeRemaining',
                    direction: 'out',
                    relatedStateVariable: 'LeaseTimeRemaining',
                  },
                  {
                    name: 'NewInterfaceType',
                    direction: 'out',
                    relatedStateVariable: 'InterfaceType',
                  },
                  {
                    name: 'NewActive',
                    direction: 'out',
                    relatedStateVariable: 'Active',
                  },
                  {
                    name: 'NewHostName',
                    direction: 'out',
                    relatedStateVariable: 'HostName',
                  },
                ],
              },
            },
            {
              name: 'GetGenericHostEntry',
              argumentList: {
                argument: [
                  {
                    name: 'NewIndex',
                    direction: 'in',
                    relatedStateVariable: 'HostNumberOfEntries',
                  },
                  {
                    name: 'NewIPAddress',
                    direction: 'out',
                    relatedStateVariable: 'IPAddress',
                  },
                  {
                    name: 'NewAddressSource',
                    direction: 'out',
                    relatedStateVariable: 'AddressSource',
                  },
                  {
                    name: 'NewLeaseTimeRemaining',
                    direction: 'out',
                    relatedStateVariable: 'LeaseTimeRemaining',
                  },
                  {
                    name: 'NewMACAddress',
                    direction: 'out',
                    relatedStateVariable: 'MACAddress',
                  },
                  {
                    name: 'NewInterfaceType',
                    direction: 'out',
                    relatedStateVariable: 'InterfaceType',
                  },
                  {
                    name: 'NewActive',
                    direction: 'out',
                    relatedStateVariable: 'Active',
                  },
                  {
                    name: 'NewHostName',
                    direction: 'out',
                    relatedStateVariable: 'HostName',
                  },
                ],
              },
            },
            {
              name: 'X_AVM-DE_GetInfo',
              argumentList: {
                argument: [
                  {
                    name: 'NewX_AVM-DE_FriendlynameMinChars',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_FriendlynameMinChars',
                  },
                  {
                    name: 'NewX_AVM-DE_FriendlynameMaxChars',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_FriendlynameMaxChars',
                  },
                  {
                    name: 'NewX_AVM-DE_HostnameMinChars',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_HostnameMinChars',
                  },
                  {
                    name: 'NewX_AVM-DE_HostnameMaxChars',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_HostnameMaxChars',
                  },
                  {
                    name: 'NewX_AVM-DE_HostnameAllowedChars',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_HostnameAllowedChars',
                  },
                ],
              },
            },
            {
              name: 'X_AVM-DE_GetChangeCounter',
              argumentList: {
                argument: {
                  name: 'NewX_AVM-DE_ChangeCounter',
                  direction: 'out',
                  relatedStateVariable: 'X_AVM-DE_ChangeCounter',
                },
              },
            },
            {
              name: 'X_AVM-DE_SetHostNameByMACAddress',
              argumentList: {
                argument: [
                  {
                    name: 'NewMACAddress',
                    direction: 'in',
                    relatedStateVariable: 'MACAddress',
                  },
                  {
                    name: 'NewHostName',
                    direction: 'in',
                    relatedStateVariable: 'HostName',
                  },
                ],
              },
            },
            {
              name: 'X_AVM-DE_GetAutoWakeOnLANByMACAddress',
              argumentList: {
                argument: [
                  {
                    name: 'NewMACAddress',
                    direction: 'in',
                    relatedStateVariable: 'MACAddress',
                  },
                  {
                    name: 'NewAutoWOLEnabled',
                    direction: 'out',
                    relatedStateVariable: 'AutoWOLEnabled',
                  },
                ],
              },
            },
            {
              name: 'X_AVM-DE_SetAutoWakeOnLANByMACAddress',
              argumentList: {
                argument: [
                  {
                    name: 'NewMACAddress',
                    direction: 'in',
                    relatedStateVariable: 'MACAddress',
                  },
                  {
                    name: 'NewAutoWOLEnabled',
                    direction: 'in',
                    relatedStateVariable: 'AutoWOLEnabled',
                  },
                ],
              },
            },
            {
              name: 'X_AVM-DE_WakeOnLANByMACAddress',
              argumentList: {
                argument: {
                  name: 'NewMACAddress',
                  direction: 'in',
                  relatedStateVariable: 'MACAddress',
                },
              },
            },
            {
              name: 'X_AVM-DE_GetSpecificHostEntryByIP',
              argumentList: {
                argument: [
                  {
                    name: 'NewIPAddress',
                    direction: 'in',
                    relatedStateVariable: 'IPAddress',
                  },
                  {
                    name: 'NewMACAddress',
                    direction: 'out',
                    relatedStateVariable: 'MACAddress',
                  },
                  {
                    name: 'NewActive',
                    direction: 'out',
                    relatedStateVariable: 'Active',
                  },
                  {
                    name: 'NewHostName',
                    direction: 'out',
                    relatedStateVariable: 'HostName',
                  },
                  {
                    name: 'NewInterfaceType',
                    direction: 'out',
                    relatedStateVariable: 'InterfaceType',
                  },
                  {
                    name: 'NewX_AVM-DE_Port',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_Port',
                  },
                  {
                    name: 'NewX_AVM-DE_Speed',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_Speed',
                  },
                  {
                    name: 'NewX_AVM-DE_UpdateAvailable',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_UpdateAvailable',
                  },
                  {
                    name: 'NewX_AVM-DE_UpdateSuccessful',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_UpdateSuccessful',
                  },
                  {
                    name: 'NewX_AVM-DE_InfoURL',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_InfoURL',
                  },
                  {
                    name: 'NewX_AVM-DE_MACAddressList',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_MACAddressList',
                  },
                  {
                    name: 'NewX_AVM-DE_Model',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_Model',
                  },
                  {
                    name: 'NewX_AVM-DE_URL',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_URL',
                  },
                  {
                    name: 'NewX_AVM-DE_Guest',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_Guest',
                  },
                  {
                    name: 'NewX_AVM-DE_RequestClient',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_RequestClient',
                  },
                  {
                    name: 'NewX_AVM-DE_VPN',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_VPN',
                  },
                  {
                    name: 'NewX_AVM-DE_WANAccess',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_WANAccess',
                  },
                  {
                    name: 'NewX_AVM-DE_Disallow',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_Disallow',
                  },
                  {
                    name: 'NewX_AVM-DE_IsMeshable',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_IsMeshable',
                  },
                  {
                    name: 'NewX_AVM-DE_Priority',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_Priority',
                  },
                  {
                    name: 'NewX_AVM-DE_FriendlyName',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_FriendlyName',
                  },
                  {
                    name: 'NewX_AVM-DE_FriendlyNameIsWriteable',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_FriendlyNameIsWriteable',
                  },
                ],
              },
            },
            {
              name: 'X_AVM-DE_HostsCheckUpdate',
            },
            {
              name: 'X_AVM-DE_HostDoUpdate',
              argumentList: {
                argument: {
                  name: 'NewMACAddress',
                  direction: 'in',
                  relatedStateVariable: 'MACAddress',
                },
              },
            },
            {
              name: 'X_AVM-DE_SetPrioritizationByIP',
              argumentList: {
                argument: [
                  {
                    name: 'NewIPAddress',
                    direction: 'in',
                    relatedStateVariable: 'IPAddress',
                  },
                  {
                    name: 'NewX_AVM-DE_Priority',
                    direction: 'in',
                    relatedStateVariable: 'X_AVM-DE_Priority',
                  },
                ],
              },
            },
            {
              name: 'X_AVM-DE_GetHostListPath',
              argumentList: {
                argument: {
                  name: 'NewX_AVM-DE_HostListPath',
                  direction: 'out',
                  relatedStateVariable: 'X_AVM-DE_HostListPath',
                },
              },
            },
            {
              name: 'X_AVM-DE_GetMeshListPath',
              argumentList: {
                argument: {
                  name: 'NewX_AVM-DE_MeshListPath',
                  direction: 'out',
                  relatedStateVariable: 'X_AVM-DE_MeshListPath',
                },
              },
            },
            {
              name: 'X_AVM-DE_GetFriendlyName',
              argumentList: {
                argument: {
                  name: 'NewX_AVM-DE_FriendlyName',
                  direction: 'out',
                  relatedStateVariable: 'X_AVM-DE_FriendlyName',
                },
              },
            },
            {
              name: 'X_AVM-DE_SetFriendlyName',
              argumentList: {
                argument: {
                  name: 'NewX_AVM-DE_FriendlyName',
                  direction: 'in',
                  relatedStateVariable: 'X_AVM-DE_FriendlyName',
                },
              },
            },
            {
              name: 'X_AVM-DE_SetFriendlyNameByIP',
              argumentList: {
                argument: [
                  {
                    name: 'NewIPAddress',
                    direction: 'in',
                    relatedStateVariable: 'IPAddress',
                  },
                  {
                    name: 'NewX_AVM-DE_FriendlyName',
                    direction: 'in',
                    relatedStateVariable: 'X_AVM-DE_FriendlyName',
                  },
                ],
              },
            },
            {
              name: 'X_AVM-DE_SetFriendlyNameByMAC',
              argumentList: {
                argument: [
                  {
                    name: 'NewMACAddress',
                    direction: 'in',
                    relatedStateVariable: 'MACAddress',
                  },
                  {
                    name: 'NewX_AVM-DE_FriendlyName',
                    direction: 'in',
                    relatedStateVariable: 'X_AVM-DE_FriendlyName',
                  },
                ],
              },
            },
          ],
        },
        serviceStateTable: {
          stateVariable: [
            {
              name: 'HostNumberOfEntries',
              dataType: 'ui2',
              defaultValue: 0,
              '@@sendEvents': 'yes',
            },
            {
              name: 'MACAddress',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'IPAddress',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'AddressSource',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'LeaseTimeRemaining',
              dataType: 'i4',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'InterfaceType',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'Active',
              dataType: 'boolean',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'HostName',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_ChangeCounter',
              dataType: 'ui4',
              defaultValue: 0,
              '@@sendEvents': 'yes',
            },
            {
              name: 'AutoWOLEnabled',
              dataType: 'boolean',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_Disallow',
              dataType: 'boolean',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_FriendlyName',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_FriendlyNameIsWriteable',
              dataType: 'boolean',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_FriendlynameMaxChars',
              dataType: 'ui2',
              defaultValue: 64,
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_FriendlynameMinChars',
              dataType: 'ui2',
              defaultValue: 1,
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_Guest',
              dataType: 'boolean',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_HostnameAllowedChars',
              dataType: 'string',
              defaultValue: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-',
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_HostnameMaxChars',
              dataType: 'ui2',
              defaultValue: 63,
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_HostnameMinChars',
              dataType: 'ui2',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_MACAddressList',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_Port',
              dataType: 'ui4',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_RequestClient',
              dataType: 'boolean',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_Speed',
              dataType: 'ui4',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_URL',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_UpdateAvailable',
              dataType: 'boolean',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_UpdateSuccessful',
              dataType: 'string',
              allowedValueList: {
                allowedValue: ['unknown', 'failed', 'succeeded'],
              },
              defaultValue: 'unknown',
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_VPN',
              dataType: 'boolean',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_InfoURL',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_IsMeshable',
              dataType: 'boolean',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_Priority',
              dataType: 'boolean',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_Model',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_HostListPath',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_MeshListPath',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_WANAccess',
              dataType: 'string',
              allowedValueList: {
                allowedValue: ['unknown', 'error', 'granted', 'denied'],
              },
              defaultValue: 'unknown',
              '@@sendEvents': 'no',
            },
          ],
        },
        '@@xmlns': 'urn:dslforum-org:service-1-0',
      },
    }),
  )
})
