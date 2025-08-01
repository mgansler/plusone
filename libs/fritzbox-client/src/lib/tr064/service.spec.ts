import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { z } from 'zod'

import { singleArgumentListArgumentXmlSpec } from '../stubs/custom/single-argumentList.argument.xml.spec'

import type { serviceSchema } from './schema'
import { Service } from './service'

describe('service', () => {
  const server = setupServer()

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })

  afterAll(() => {
    server.close()
  })

  it('should accept single argumentList.argument', async () => {
    const service = serviceMock({ SCPDURL: '/single-argumentList.argument' })

    server.use(singleArgumentListArgumentXmlSpec)

    await service.parseActions()
  })

  it('should reject malformed response', async () => {
    const service = serviceMock({ SCPDURL: '/malformed-service' })

    server.use(http.get('https://fritz-test.box:49443/malformed-service', () => HttpResponse.xml('')))

    await expect(service.parseActions()).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "expected": "object",
          "code": "invalid_type",
          "path": [
            "scpd"
          ],
          "message": "Invalid input: expected object, received undefined"
        }
      ]]
    `)
  })
})

function serviceMock(partial: Partial<z.infer<typeof serviceSchema>>): Service {
  return new Service(
    { host: 'fritz-test.box', port: 49443 },
    {
      serviceType: 'urn:dslforum-org:service:X_Mock-Service-Type:1',
      serviceId: 'urn:X_Mock-Service-Type-com:serviceId:X_Mock-Service-Type1',
      controlURL: '/upnp/control/x_mock',
      eventSubURL: '/upnp/control/x_mock',
      SCPDURL: '',
      ...partial,
    },
  )
}
