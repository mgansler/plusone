import { http, HttpResponse } from 'msw'

import { xmlBuilder } from '../../services/shared'

export const singleArgumentListArgumentXmlSpec = http.get(
  'https://fritz-test.box:49443/single-argumentList.argument',
  () => {
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
                name: 'ActionWithSingleArgument',
                argumentList: {
                  argument: {
                    name: 'NewEnable',
                    direction: 'in',
                    relatedStateVariable: 'Enable',
                  },
                },
              },
              {
                name: 'ActionWithArgumentList',
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
                  ],
                },
              },
              {
                name: 'ActionWithoutArgumentList',
              },
            ],
          },
          serviceStateTable: {
            stateVariable: [],
          },
          '@@xmlns': 'urn:dslforum-org:service-1-0',
        },
      }),
    )
  },
)
