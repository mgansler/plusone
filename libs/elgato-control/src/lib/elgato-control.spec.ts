import { setColor } from './elgato-control'

describe('elgatoControl', () => {
  it('should work', async () => {
    // await discoverDevices('Light-Strip-Desk')
    // await discoverDevices('Light-Strip-Background')

    // await setColor('Light-Strip-Background', 273, 67, 100)

    // for (let hue = 0; hue <= 360; hue += 0.01) {
    //   console.log(hue)
    //   await setColor('Light-Strip-Desk', hue, 100, 100)
    //   await new Promise(resolve => setTimeout(resolve, 10))
    // }

    await new Promise((resolve) => setTimeout(resolve, 1_000))
    await setColor('Light-Strip-Desk', 273, 67, 100)

    // await discoverDevices('Elgato-Ring-Light-Desk')
  }, 60_000)
})
