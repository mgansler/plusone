import { http, HttpResponse } from 'msw'

import { xmlBuilder } from '../services/shared'

import { authChallengeResponseSpec } from './auth-challenge-response.spec'

export const x_contactGetPhonebookXmlSpec = http.post(
  'https://fritz-test.box:49443/upnp/control/x_contact',
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
            'u:GetPhonebookResponse': {
              NewPhonebookName: 'telephone book',
              NewPhonebookExtraID: '',
              NewPhonebookURL: 'https://fritz-test.box:49443/phonebook.lua?sid=deadbeef12345678&pbid=0',
              '@@xmlns:u': 'urn:dslforum-org:service:X_AVM-DE_OnTel:1',
            },
          },
          '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
          '@@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
        },
      }),
    )
  },
)

export const x_contactPhonebook = http.get('https://fritz-test.box:49443/phonebook.lua', () => {
  return HttpResponse.xml(
    xmlBuilder.build({
      '?xml': {
        '@@version': '1.0',
        '@@encoding': 'UTF-8',
      },
      phonebooks: {
        phonebook: {
          timestamp: 1716053527,
          contact: [
            {
              category: 0,
              person: {
                realName: 'Alarmclock 1',
              },
              uniqueid: 5,
              telephony: {
                services: '',
                number: {
                  '#text': '**41',
                  '@@type': '',
                  '@@vanity': '',
                  '@@prio': '1',
                },
              },
            },
            {
              category: 0,
              person: {
                realName: 'Alarmclock 2',
              },
              uniqueid: 6,
              telephony: {
                services: '',
                number: {
                  '#text': '**42',
                  '@@type': '',
                  '@@vanity': '',
                  '@@prio': '1',
                },
              },
            },
            {
              category: 0,
              person: {
                realName: 'Alarmclock 3',
              },
              uniqueid: 7,
              telephony: {
                services: '',
                number: {
                  '#text': '**43',
                  '@@type': '',
                  '@@vanity': '',
                  '@@prio': '',
                },
              },
            },
            {
              category: 0,
              person: {
                realName: 'All internal',
              },
              uniqueid: 3,
              telephony: {
                services: '',
                number: {
                  '#text': '**9',
                  '@@type': 'intern',
                  '@@vanity': '',
                  '@@prio': '1',
                },
              },
            },
            {
              category: 0,
              person: {
                realName: 'Answering Machine',
              },
              uniqueid: 11,
              telephony: {
                services: '',
                number: [
                  {
                    '#text': '**600',
                    '@@type': 'intern',
                    '@@vanity': '',
                    '@@prio': '1',
                  },
                  {
                    '#text': '**605',
                    '@@type': 'memo',
                    '@@vanity': '',
                    '@@prio': '',
                  },
                ],
              },
            },
            {
              category: 0,
              person: {
                realName: 'AVM voice clip (HD)',
              },
              uniqueid: 0,
              telephony: {
                services: '',
                number: {
                  '#text': '550@hd-telefonie.avm.de',
                  '@@type': 'work',
                  '@@quickdial': '99',
                  '@@vanity': '',
                  '@@prio': '1',
                },
              },
            },
            {
              category: 0,
              person: {
                realName: 'DECT all',
              },
              uniqueid: 4,
              telephony: {
                services: '',
                number: {
                  '#text': '**50',
                  '@@type': '',
                  '@@vanity': '',
                  '@@prio': '1',
                },
              },
            },
            {
              category: 0,
              person: {
                realName: 'FRITZ!Fon C5',
              },
              uniqueid: 12,
              telephony: {
                services: '',
                number: {
                  '#text': '**610',
                  '@@type': 'intern',
                  '@@vanity': '',
                  '@@prio': '1',
                },
              },
            },
            {
              category: 1,
              person: {
                realName: 'Some important person',
              },
              uniqueid: 13,
              telephony: {
                services: '',
                number: {
                  '#text': 123456789,
                  '@@type': 'home',
                  '@@vanity': '',
                  '@@prio': '1',
                },
              },
            },
            {
              category: 0,
              person: {
                realName: 'A not so important person',
              },
              uniqueid: 14,
              telephony: {
                services: '',
                number: {
                  '#text': 987654321,
                  '@@type': 'work',
                  '@@vanity': '',
                  '@@prio': '1',
                },
              },
            },
            {
              category: 0,
              person: {
                realName: 'Telephone',
              },
              uniqueid: 8,
              telephony: {
                services: '',
                number: {
                  '#text': '**1',
                  '@@type': 'intern',
                  '@@vanity': '',
                  '@@prio': '1',
                },
              },
            },
            {
              category: 0,
              person: {
                realName: 'Telephone',
              },
              uniqueid: 9,
              telephony: {
                services: '',
                number: {
                  '#text': '**2',
                  '@@type': 'intern',
                  '@@vanity': '',
                  '@@prio': '1',
                },
              },
            },
          ],
          '@@owner': '0',
          '@@name': 'telephone book',
        },
      },
    }),
  )
})
