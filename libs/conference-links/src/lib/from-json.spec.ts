import { fromJson } from './from-json'

describe('fromJsonString', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should return empty array for string', () => {
    const givenValue = 'hello world'
    const expectedResult = []

    const actualResult = fromJson(givenValue)
    expect(actualResult).toEqual(expectedResult)
  })

  it('should return empty array for valid, but wrong json', () => {
    const givenValue = { isValidJson: true }
    const expectedResult = []

    const actualResult = fromJson(givenValue)
    expect(actualResult).toEqual(expectedResult)
  })

  it('should return empty array for invalid zoom url', () => {
    const givenValue = [
      {
        title: 'hello world',
        type: 'zoom',
        url: 'zoommtg://example.zoom.com/join?action=join&notaconfno=123456789',
      },
    ]
    const expectedResult = []

    const actualResult = fromJson(givenValue)
    expect(actualResult).toEqual(expectedResult)
  })

  it('should return valid conference link', () => {
    const givenValue = [
      {
        title: 'hello world',
        type: 'zoom',
        url: 'zoommtg://example.zoom.com/join?action=join&confno=123456789',
      },
    ]
    const expectedResult = [
      {
        title: 'hello world',
        type: 'zoom',
        url: 'zoommtg://example.zoom.com/join?action=join&confno=123456789',
      },
    ]

    const actualResult = fromJson(givenValue)
    expect(actualResult).toEqual(expectedResult)
  })
})
