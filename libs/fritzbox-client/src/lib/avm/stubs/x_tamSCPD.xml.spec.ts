import { http, HttpResponse } from 'msw'

import { xmlBuilder } from '../shared'

export const x_tamSCPDXmlSpec = http.get('http://fritz-test.box:49000/x_tamSCPD.xml', () => {
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
              name: 'GetInfo',
              argumentList: {
                argument: [
                  {
                    name: 'NewIndex',
                    direction: 'in',
                    relatedStateVariable: 'Index',
                  },
                  {
                    name: 'NewEnable',
                    direction: 'out',
                    relatedStateVariable: 'Enable',
                  },
                  {
                    name: 'NewName',
                    direction: 'out',
                    relatedStateVariable: 'Name',
                  },
                  {
                    name: 'NewTAMRunning',
                    direction: 'out',
                    relatedStateVariable: 'TAMRunning',
                  },
                  {
                    name: 'NewStick',
                    direction: 'out',
                    relatedStateVariable: 'Stick',
                  },
                  {
                    name: 'NewStatus',
                    direction: 'out',
                    relatedStateVariable: 'Status',
                  },
                  {
                    name: 'NewCapacity',
                    direction: 'out',
                    relatedStateVariable: 'Capacity',
                  },
                  {
                    name: 'NewMode',
                    direction: 'out',
                    relatedStateVariable: 'Mode',
                  },
                  {
                    name: 'NewRingSeconds',
                    direction: 'out',
                    relatedStateVariable: 'RingSeconds',
                  },
                  {
                    name: 'NewPhoneNumbers',
                    direction: 'out',
                    relatedStateVariable: 'PhoneNumbers',
                  },
                ],
              },
            },
            {
              name: 'SetEnable',
              argumentList: {
                argument: [
                  {
                    name: 'NewIndex',
                    direction: 'in',
                    relatedStateVariable: 'Index',
                  },
                  {
                    name: 'NewEnable',
                    direction: 'in',
                    relatedStateVariable: 'Enable',
                  },
                ],
              },
            },
            {
              name: 'GetMessageList',
              argumentList: {
                argument: [
                  {
                    name: 'NewIndex',
                    direction: 'in',
                    relatedStateVariable: 'Index',
                  },
                  {
                    name: 'NewURL',
                    direction: 'out',
                    relatedStateVariable: 'URL',
                  },
                ],
              },
            },
            {
              name: 'MarkMessage',
              argumentList: {
                argument: [
                  {
                    name: 'NewIndex',
                    direction: 'in',
                    relatedStateVariable: 'Index',
                  },
                  {
                    name: 'NewMessageIndex',
                    direction: 'in',
                    relatedStateVariable: 'MessageIndex',
                  },
                  {
                    name: 'NewMarkedAsRead',
                    direction: 'in',
                    relatedStateVariable: 'MarkedAsRead',
                  },
                ],
              },
            },
            {
              name: 'DeleteMessage',
              argumentList: {
                argument: [
                  {
                    name: 'NewIndex',
                    direction: 'in',
                    relatedStateVariable: 'Index',
                  },
                  {
                    name: 'NewMessageIndex',
                    direction: 'in',
                    relatedStateVariable: 'MessageIndex',
                  },
                ],
              },
            },
            {
              name: 'GetList',
              argumentList: {
                argument: {
                  name: 'NewTAMList',
                  direction: 'out',
                  relatedStateVariable: 'TAMList',
                },
              },
            },
          ],
        },
        serviceStateTable: {
          stateVariable: [
            {
              name: 'Enable',
              dataType: 'boolean',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'Index',
              dataType: 'ui2',
              defaultValue: 0,
              allowedValueRange: {
                minimum: 0,
                maximum: 4,
                step: 1,
              },
              '@@sendEvents': 'no',
            },
            {
              name: 'Name',
              dataType: 'string',
              defaultValue: '',
              '@@sendEvents': 'no',
            },
            {
              name: 'TAMRunning',
              dataType: 'boolean',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'Stick',
              dataType: 'ui2',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'Status',
              dataType: 'ui2',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'Capacity',
              dataType: 'ui4',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'MessageIndex',
              dataType: 'ui2',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'URL',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'MarkedAsRead',
              dataType: 'boolean',
              defaultValue: 1,
              '@@sendEvents': 'no',
            },
            {
              name: 'TAMList',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'Mode',
              dataType: 'string',
              allowedValueList: {
                allowedValue: ['play_announcement', 'record_message', 'timeprofile'],
              },
              '@@sendEvents': 'no',
            },
            {
              name: 'PhoneNumbers',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'RingSeconds',
              dataType: 'ui2',
              defaultValue: 0,
              allowedValueRange: {
                minimum: 0,
                maximum: 255,
                step: 1,
              },
              '@@sendEvents': 'no',
            },
          ],
        },
        '@@xmlns': 'urn:dslforum-org:service-1-0',
      },
    }),
  )
})
