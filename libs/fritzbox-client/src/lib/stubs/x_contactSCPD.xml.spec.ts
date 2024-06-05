import { http, HttpResponse } from 'msw'

import { xmlBuilder } from '../services/shared'

export const x_contactSCPDXmlSpec = http.get('https://fritz-test.box:49443/x_contactSCPD.xml', () => {
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
                    name: 'NewEnable',
                    direction: 'out',
                    relatedStateVariable: 'Enable',
                  },
                  {
                    name: 'NewStatus',
                    direction: 'out',
                    relatedStateVariable: 'Status',
                  },
                  {
                    name: 'NewLastConnect',
                    direction: 'out',
                    relatedStateVariable: 'LastConnect',
                  },
                  {
                    name: 'NewUrl',
                    direction: 'out',
                    relatedStateVariable: 'Url',
                  },
                  {
                    name: 'NewServiceId',
                    direction: 'out',
                    relatedStateVariable: 'ServiceId',
                  },
                  {
                    name: 'NewUsername',
                    direction: 'out',
                    relatedStateVariable: 'Username',
                  },
                  {
                    name: 'NewName',
                    direction: 'out',
                    relatedStateVariable: 'Name',
                  },
                ],
              },
            },
            {
              name: 'SetEnable',
              argumentList: {
                argument: {
                  name: 'NewEnable',
                  direction: 'in',
                  relatedStateVariable: 'Enable',
                },
              },
            },
            {
              name: 'SetConfig',
              argumentList: {
                argument: [
                  {
                    name: 'NewEnable',
                    direction: 'in',
                    relatedStateVariable: 'Enable',
                  },
                  {
                    name: 'NewUrl',
                    direction: 'in',
                    relatedStateVariable: 'Url',
                  },
                  {
                    name: 'NewServiceId',
                    direction: 'in',
                    relatedStateVariable: 'ServiceId',
                  },
                  {
                    name: 'NewUsername',
                    direction: 'in',
                    relatedStateVariable: 'Username',
                  },
                  {
                    name: 'NewPassword',
                    direction: 'in',
                    relatedStateVariable: 'Password',
                  },
                  {
                    name: 'NewName',
                    direction: 'in',
                    relatedStateVariable: 'Name',
                  },
                ],
              },
            },
            {
              name: 'GetInfoByIndex',
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
                    name: 'NewStatus',
                    direction: 'out',
                    relatedStateVariable: 'Status',
                  },
                  {
                    name: 'NewLastConnect',
                    direction: 'out',
                    relatedStateVariable: 'LastConnect',
                  },
                  {
                    name: 'NewUrl',
                    direction: 'out',
                    relatedStateVariable: 'Url',
                  },
                  {
                    name: 'NewServiceId',
                    direction: 'out',
                    relatedStateVariable: 'ServiceId',
                  },
                  {
                    name: 'NewUsername',
                    direction: 'out',
                    relatedStateVariable: 'Username',
                  },
                  {
                    name: 'NewName',
                    direction: 'out',
                    relatedStateVariable: 'Name',
                  },
                ],
              },
            },
            {
              name: 'SetEnableByIndex',
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
              name: 'SetConfigByIndex',
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
                  {
                    name: 'NewUrl',
                    direction: 'in',
                    relatedStateVariable: 'Url',
                  },
                  {
                    name: 'NewServiceId',
                    direction: 'in',
                    relatedStateVariable: 'ServiceId',
                  },
                  {
                    name: 'NewUsername',
                    direction: 'in',
                    relatedStateVariable: 'Username',
                  },
                  {
                    name: 'NewPassword',
                    direction: 'in',
                    relatedStateVariable: 'Password',
                  },
                  {
                    name: 'NewName',
                    direction: 'in',
                    relatedStateVariable: 'Name',
                  },
                ],
              },
            },
            {
              name: 'DeleteByIndex',
              argumentList: {
                argument: {
                  name: 'NewIndex',
                  direction: 'in',
                  relatedStateVariable: 'Index',
                },
              },
            },
            {
              name: 'GetNumberOfEntries',
              argumentList: {
                argument: {
                  name: 'NewOnTelNumberOfEntries',
                  direction: 'out',
                  relatedStateVariable: 'OnTelNumberOfEntries',
                },
              },
            },
            {
              name: 'GetCallList',
              argumentList: {
                argument: {
                  name: 'NewCallListURL',
                  direction: 'out',
                  relatedStateVariable: 'CallListURL',
                },
              },
            },
            {
              name: 'GetPhonebookList',
              argumentList: {
                argument: {
                  name: 'NewPhonebookList',
                  direction: 'out',
                  relatedStateVariable: 'PhonebookList',
                },
              },
            },
            {
              name: 'GetPhonebook',
              argumentList: {
                argument: [
                  {
                    name: 'NewPhonebookID',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookID',
                  },
                  {
                    name: 'NewPhonebookName',
                    direction: 'out',
                    relatedStateVariable: 'PhonebookName',
                  },
                  {
                    name: 'NewPhonebookExtraID',
                    direction: 'out',
                    relatedStateVariable: 'PhonebookExtraID',
                  },
                  {
                    name: 'NewPhonebookURL',
                    direction: 'out',
                    relatedStateVariable: 'PhonebookURL',
                  },
                ],
              },
            },
            {
              name: 'AddPhonebook',
              argumentList: {
                argument: [
                  {
                    name: 'NewPhonebookExtraID',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookExtraID',
                  },
                  {
                    name: 'NewPhonebookName',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookName',
                  },
                ],
              },
            },
            {
              name: 'DeletePhonebook',
              argumentList: {
                argument: [
                  {
                    name: 'NewPhonebookID',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookID',
                  },
                  {
                    name: 'NewPhonebookExtraID',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookExtraID',
                  },
                ],
              },
            },
            {
              name: 'GetPhonebookEntry',
              argumentList: {
                argument: [
                  {
                    name: 'NewPhonebookID',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookID',
                  },
                  {
                    name: 'NewPhonebookEntryID',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookEntryID',
                  },
                  {
                    name: 'NewPhonebookEntryData',
                    direction: 'out',
                    relatedStateVariable: 'PhonebookEntryData',
                  },
                ],
              },
            },
            {
              name: 'GetPhonebookEntryUID',
              argumentList: {
                argument: [
                  {
                    name: 'NewPhonebookID',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookID',
                  },
                  {
                    name: 'NewPhonebookEntryUniqueID',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookEntryUniqueID',
                  },
                  {
                    name: 'NewPhonebookEntryData',
                    direction: 'out',
                    relatedStateVariable: 'PhonebookEntryData',
                  },
                ],
              },
            },
            {
              name: 'SetPhonebookEntry',
              argumentList: {
                argument: [
                  {
                    name: 'NewPhonebookID',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookID',
                  },
                  {
                    name: 'NewPhonebookEntryID',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookEntryID',
                  },
                  {
                    name: 'NewPhonebookEntryData',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookEntryData',
                  },
                ],
              },
            },
            {
              name: 'SetPhonebookEntryUID',
              argumentList: {
                argument: [
                  {
                    name: 'NewPhonebookID',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookID',
                  },
                  {
                    name: 'NewPhonebookEntryData',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookEntryData',
                  },
                  {
                    name: 'NewPhonebookEntryUniqueID',
                    direction: 'out',
                    relatedStateVariable: 'PhonebookEntryUniqueID',
                  },
                ],
              },
            },
            {
              name: 'DeletePhonebookEntry',
              argumentList: {
                argument: [
                  {
                    name: 'NewPhonebookID',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookID',
                  },
                  {
                    name: 'NewPhonebookEntryID',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookEntryID',
                  },
                ],
              },
            },
            {
              name: 'DeletePhonebookEntryUID',
              argumentList: {
                argument: [
                  {
                    name: 'NewPhonebookID',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookID',
                  },
                  {
                    name: 'NewPhonebookEntryUniqueID',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookEntryUniqueID',
                  },
                ],
              },
            },
            {
              name: 'GetCallBarringEntry',
              argumentList: {
                argument: [
                  {
                    name: 'NewPhonebookEntryID',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookEntryID',
                  },
                  {
                    name: 'NewPhonebookEntryData',
                    direction: 'out',
                    relatedStateVariable: 'PhonebookEntryData',
                  },
                ],
              },
            },
            {
              name: 'GetCallBarringEntryByNum',
              argumentList: {
                argument: [
                  {
                    name: 'NewNumber',
                    direction: 'in',
                    relatedStateVariable: 'Number',
                  },
                  {
                    name: 'NewPhonebookEntryData',
                    direction: 'out',
                    relatedStateVariable: 'PhonebookEntryData',
                  },
                ],
              },
            },
            {
              name: 'GetCallBarringList',
              argumentList: {
                argument: {
                  name: 'NewPhonebookURL',
                  direction: 'out',
                  relatedStateVariable: 'PhonebookURL',
                },
              },
            },
            {
              name: 'SetCallBarringEntry',
              argumentList: {
                argument: [
                  {
                    name: 'NewPhonebookEntryData',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookEntryData',
                  },
                  {
                    name: 'NewPhonebookEntryUniqueID',
                    direction: 'out',
                    relatedStateVariable: 'PhonebookEntryUniqueID',
                  },
                ],
              },
            },
            {
              name: 'DeleteCallBarringEntryUID',
              argumentList: {
                argument: {
                  name: 'NewPhonebookEntryUniqueID',
                  direction: 'in',
                  relatedStateVariable: 'PhonebookEntryUniqueID',
                },
              },
            },
            {
              name: 'GetDECTHandsetList',
              argumentList: {
                argument: {
                  name: 'NewDectIDList',
                  direction: 'out',
                  relatedStateVariable: 'DectIDList',
                },
              },
            },
            {
              name: 'GetDECTHandsetInfo',
              argumentList: {
                argument: [
                  {
                    name: 'NewDectID',
                    direction: 'in',
                    relatedStateVariable: 'DectID',
                  },
                  {
                    name: 'NewHandsetName',
                    direction: 'out',
                    relatedStateVariable: 'HandsetName',
                  },
                  {
                    name: 'NewPhonebookID',
                    direction: 'out',
                    relatedStateVariable: 'PhonebookID',
                  },
                ],
              },
            },
            {
              name: 'SetDECTHandsetPhonebook',
              argumentList: {
                argument: [
                  {
                    name: 'NewDectID',
                    direction: 'in',
                    relatedStateVariable: 'DectID',
                  },
                  {
                    name: 'NewPhonebookID',
                    direction: 'in',
                    relatedStateVariable: 'PhonebookID',
                  },
                ],
              },
            },
            {
              name: 'GetNumberOfDeflections',
              argumentList: {
                argument: {
                  name: 'NewNumberOfDeflections',
                  direction: 'out',
                  relatedStateVariable: 'NumberOfDeflections',
                },
              },
            },
            {
              name: 'GetDeflection',
              argumentList: {
                argument: [
                  {
                    name: 'NewDeflectionId',
                    direction: 'in',
                    relatedStateVariable: 'DeflectionId',
                  },
                  {
                    name: 'NewEnable',
                    direction: 'out',
                    relatedStateVariable: 'Enable',
                  },
                  {
                    name: 'NewType',
                    direction: 'out',
                    relatedStateVariable: 'Type',
                  },
                  {
                    name: 'NewNumber',
                    direction: 'out',
                    relatedStateVariable: 'Number',
                  },
                  {
                    name: 'NewDeflectionToNumber',
                    direction: 'out',
                    relatedStateVariable: 'DeflectionToNumber',
                  },
                  {
                    name: 'NewMode',
                    direction: 'out',
                    relatedStateVariable: 'Mode',
                  },
                  {
                    name: 'NewOutgoing',
                    direction: 'out',
                    relatedStateVariable: 'Outgoing',
                  },
                  {
                    name: 'NewPhonebookID',
                    direction: 'out',
                    relatedStateVariable: 'PhonebookID',
                  },
                ],
              },
            },
            {
              name: 'GetDeflections',
              argumentList: {
                argument: {
                  name: 'NewDeflectionList',
                  direction: 'out',
                  relatedStateVariable: 'DeflectionList',
                },
              },
            },
            {
              name: 'SetDeflectionEnable',
              argumentList: {
                argument: [
                  {
                    name: 'NewDeflectionId',
                    direction: 'in',
                    relatedStateVariable: 'DeflectionId',
                  },
                  {
                    name: 'NewEnable',
                    direction: 'in',
                    relatedStateVariable: 'Enable',
                  },
                ],
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
              name: 'Status',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'Url',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'ServiceId',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'Username',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'Password',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'LastConnect',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'Name',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'OnTelNumberOfEntries',
              dataType: 'ui2',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'Index',
              dataType: 'ui2',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'CallListURL',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'PhonebookList',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'PhonebookID',
              dataType: 'ui2',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'PhonebookName',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'PhonebookEntryData',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'PhonebookExtraID',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'PhonebookEntryID',
              dataType: 'ui4',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'PhonebookEntryUniqueID',
              dataType: 'ui4',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'PhonebookURL',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'DectIDList',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'DectID',
              dataType: 'ui2',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'HandsetName',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'NumberOfDeflections',
              dataType: 'ui2',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'DeflectionId',
              dataType: 'ui2',
              defaultValue: 0,
              '@@sendEvents': 'no',
            },
            {
              name: 'Type',
              dataType: 'string',
              defaultValue: 'unknown',
              allowedValueList: {
                allowedValue: [
                  'unknown',
                  'toAny',
                  'toPOTS',
                  'toVoIP',
                  'toMSN',
                  'fromAnonymous',
                  'fromAll',
                  'fromNumber',
                  'fromVIP',
                  'fromNotInPhonebook',
                  'fromPB',
                  'fon1',
                  'fon2',
                  'fon3',
                  'fon4',
                ],
              },
              '@@sendEvents': 'no',
            },
            {
              name: 'Number',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'DeflectionToNumber',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'Mode',
              dataType: 'string',
              defaultValue: 'eUnknown',
              allowedValueList: {
                allowedValue: [
                  'eUnknown',
                  'eImmediately',
                  'eShortDelayed',
                  'eLongDelayed',
                  'eBusy',
                  'eParallelCall',
                  'eNoSignal',
                  'eVIP',
                  'eDelayed',
                  'eDelayedOrBusy',
                  'eBellBlockade',
                  'eDirectCall',
                  'eOff',
                ],
              },
              '@@sendEvents': 'no',
            },
            {
              name: 'Outgoing',
              dataType: 'string',
              '@@sendEvents': 'no',
            },
            {
              name: 'DeflectionList',
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
