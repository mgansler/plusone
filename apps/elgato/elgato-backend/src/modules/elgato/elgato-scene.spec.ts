import { colorWheel } from './scenes/color-wheel'

// These are for local testing only
// eslint-disable-next-line no-restricted-properties
describe.skip('Elgato Scene', () => {
  it('should do a quick sunrise', async () => {
    // const targets = ['light-strip-desk', 'light-strip-background']
    const targets = ['elgato-light-strip-0dae']

    const calls = targets.map((target) =>
      fetch(`http://${target}:9123/elgato/lights`, {
        method: 'PUT',
        body: JSON.stringify(colorWheel),
        headers: {
          ['Content-Type']: 'application/json',
        },
      }),
    )

    const responses = await Promise.all(calls)

    expect(responses[0].status).toBe(200)
    expect(responses[1].status).toBe(200)
  })

  it('should get device info', async () => {
    const resp = await fetch('http://light-strip-background:9123/elgato/lights')
    console.log(resp.status)

    console.log(await resp.text())

    console.log((await resp.json()).lights[0].scene)
  })
})
