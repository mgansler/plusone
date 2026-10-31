import { fakeApi } from './fake-api'

vi.mock('../../../../../libs/trailcare/api-client/src/custom-axios', () => ({
  customAxiosInstance: (config: Parameters<typeof fakeApi.handle>[0]) => fakeApi.handle(config),
}))

beforeEach(() => {
  fakeApi.reset()
  try {
    localStorage.clear()
  } catch {
    // not available
  }
})

afterEach(() => {
  vi.unstubAllGlobals()
})
