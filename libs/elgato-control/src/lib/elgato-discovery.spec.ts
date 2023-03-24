import type { Service } from 'bonjour-service'
import Bonjour from 'bonjour-service'

describe('ElgatoDiscovery', () => {
  it('should work with bonjour-service', async () => {
    const bonjour = new Bonjour()
    const services: Service[] = []
    bonjour.find({ type: 'elg' }, (service) => {
      services.push(service)
    })
    await new Promise((resolve) => setTimeout(resolve, 30_000))
    console.log(services.length)
    console.log(services)
    console.log(services.length)
  }, 35_000)
})
