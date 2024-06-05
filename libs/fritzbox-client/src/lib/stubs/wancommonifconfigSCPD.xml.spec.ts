import { http, HttpResponse } from 'msw'

import { xmlBuilder } from '../services/shared'

export const wancommonifconfigSCPDXmlSpec = http.get('https://fritz-test.box:49443/wancommonifconfigSCPD.xml', () => {
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
              name: 'GetCommonLinkProperties',
              argumentList: {
                argument: [
                  {
                    name: 'NewWANAccessType',
                    direction: 'out',
                    relatedStateVariable: 'WANAccessType',
                  },
                  {
                    name: 'NewLayer1UpstreamMaxBitRate',
                    direction: 'out',
                    relatedStateVariable: 'Layer1UpstreamMaxBitRate',
                  },
                  {
                    name: 'NewLayer1DownstreamMaxBitRate',
                    direction: 'out',
                    relatedStateVariable: 'Layer1DownstreamMaxBitRate',
                  },
                  {
                    name: 'NewPhysicalLinkStatus',
                    direction: 'out',
                    relatedStateVariable: 'PhysicalLinkStatus',
                  },
                  {
                    name: 'NewX_AVM-DE_DownstreamCurrentUtilization',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_DownstreamCurrentUtilization',
                  },
                  {
                    name: 'NewX_AVM-DE_UpstreamCurrentUtilization',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_UpstreamCurrentUtilization',
                  },
                  {
                    name: 'NewX_AVM-DE_DownstreamCurrentMaxSpeed',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_DownstreamCurrentMaxSpeed',
                  },
                  {
                    name: 'NewX_AVM-DE_UpstreamCurrentMaxSpeed',
                    direction: 'out',
                    relatedStateVariable: 'X_AVM-DE_UpstreamCurrentMaxSpeed',
                  },
                ],
              },
            },
            {
              name: 'GetTotalBytesSent',
              argumentList: {
                argument: {
                  name: 'NewTotalBytesSent',
                  direction: 'out',
                  relatedStateVariable: 'TotalBytesSent',
                },
              },
            },
            {
              name: 'GetTotalBytesReceived',
              argumentList: {
                argument: {
                  name: 'NewTotalBytesReceived',
                  direction: 'out',
                  relatedStateVariable: 'TotalBytesReceived',
                },
              },
            },
            {
              name: 'GetTotalPacketsSent',
              argumentList: {
                argument: {
                  name: 'NewTotalPacketsSent',
                  direction: 'out',
                  relatedStateVariable: 'TotalPacketsSent',
                },
              },
            },
            {
              name: 'GetTotalPacketsReceived',
              argumentList: {
                argument: {
                  name: 'NewTotalPacketsReceived',
                  direction: 'out',
                  relatedStateVariable: 'TotalPacketsReceived',
                },
              },
            },
            {
              name: 'X_AVM-DE_SetWANAccessType',
              argumentList: {
                argument: {
                  name: 'NewAccessType',
                  direction: 'in',
                  relatedStateVariable: 'AccessType',
                },
              },
            },
            {
              name: 'X_AVM-DE_GetActiveProvider',
              argumentList: {
                argument: {
                  name: 'NewX_AVM-DE_Provider',
                  direction: 'out',
                  relatedStateVariable: 'X_AVM-DE_Provider',
                },
              },
            },
            {
              name: 'X_AVM-DE_GetOnlineMonitor',
              argumentList: {
                argument: [
                  {
                    name: 'NewSyncGroupIndex',
                    direction: 'in',
                    relatedStateVariable: 'SyncGroupIndex',
                  },
                  {
                    name: 'NewTotalNumberSyncGroups',
                    direction: 'out',
                    relatedStateVariable: 'TotalNumberSyncGroups',
                  },
                  {
                    name: 'NewSyncGroupName',
                    direction: 'out',
                    relatedStateVariable: 'SyncGroupName',
                  },
                  {
                    name: 'NewSyncGroupMode',
                    direction: 'out',
                    relatedStateVariable: 'SyncGroupMode',
                  },
                  {
                    name: 'Newmax_ds',
                    direction: 'out',
                    relatedStateVariable: 'max_ds',
                  },
                  {
                    name: 'Newmax_us',
                    direction: 'out',
                    relatedStateVariable: 'max_us',
                  },
                  {
                    name: 'Newds_current_bps',
                    direction: 'out',
                    relatedStateVariable: 'ds_current_bps',
                  },
                  {
                    name: 'Newmc_current_bps',
                    direction: 'out',
                    relatedStateVariable: 'mc_current_bps',
                  },
                  {
                    name: 'Newus_current_bps',
                    direction: 'out',
                    relatedStateVariable: 'us_current_bps',
                  },
                  {
                    name: 'Newprio_realtime_bps',
                    direction: 'out',
                    relatedStateVariable: 'prio_realtime_bps',
                  },
                  {
                    name: 'Newprio_high_bps',
                    direction: 'out',
                    relatedStateVariable: 'prio_high_bps',
                  },
                  {
                    name: 'Newprio_default_bps',
                    direction: 'out',
                    relatedStateVariable: 'prio_default_bps',
                  },
                  {
                    name: 'Newprio_low_bps',
                    direction: 'out',
                    relatedStateVariable: 'prio_low_bps',
                  },
                ],
              },
            },
          ],
        },
        serviceStateTable: {
          stateVariable: [
            {
              name: 'WANAccessType',
              dataType: 'string',
              allowedValueList: {
                allowedValue: [
                  'DSL',
                  'Ethernet',
                  'X_AVM-DE_Fiber',
                  'X_AVM-DE_UMTS',
                  'X_AVM-DE_Cable',
                  'X_AVM-DE_LTE',
                  'unknown',
                ],
              },
              defaultValue: 'unknown',
              '@@sendEvents': 'no',
            },
            {
              name: 'Layer1UpstreamMaxBitRate',
              dataType: 'ui4',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'Layer1DownstreamMaxBitRate',
              dataType: 'ui4',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'PhysicalLinkStatus',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'TotalBytesSent',
              dataType: 'ui4',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'TotalBytesReceived',
              dataType: 'ui4',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'TotalPacketsSent',
              dataType: 'ui4',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'TotalPacketsReceived',
              dataType: 'ui4',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'AccessType',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_Provider',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_DownstreamCurrentUtilization',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_UpstreamCurrentUtilization',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_DownstreamCurrentMaxSpeed',
              dataType: 'ui4',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'X_AVM-DE_UpstreamCurrentMaxSpeed',
              dataType: 'ui4',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'SyncGroupIndex',
              dataType: 'ui4',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'TotalNumberSyncGroups',
              dataType: 'ui4',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'SyncGroupName',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'SyncGroupMode',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'max_ds',
              dataType: 'ui4',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'max_us',
              dataType: 'ui4',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'ds_current_bps',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'mc_current_bps',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'us_current_bps',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'prio_realtime_bps',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'prio_high_bps',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'prio_default_bps',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'prio_low_bps',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
          ],
        },
        '@@xmlns': 'urn:dslforum-org:service-1-0',
      },
    }),
  )
})
