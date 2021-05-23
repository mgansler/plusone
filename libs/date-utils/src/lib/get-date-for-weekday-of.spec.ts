import { getDateForWeekdayOf } from './get-date-for-weekday-of'

describe('getDateForWeekdayOf', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date(Date.UTC(2021, 0, 1)))
  })
  afterAll(() => {
    jest.useRealTimers()
  })

  describe('this-week', () => {
    test.each`
      weekday        | year    | month | day
      ${'monday'}    | ${2020} | ${12} | ${28}
      ${'tuesday'}   | ${2020} | ${12} | ${29}
      ${'wednesday'} | ${2020} | ${12} | ${30}
      ${'thursday'}  | ${2020} | ${12} | ${31}
      ${'friday'}    | ${2021} | ${1}  | ${1}
      ${'saturday'}  | ${2021} | ${1}  | ${2}
      ${'sunday'}    | ${2021} | ${1}  | ${3}
    `('should return $year/$month/$day for $weekday', ({ weekday, year, month, day }) => {
      const actualDate = getDateForWeekdayOf(weekday)

      expect(actualDate.getUTCFullYear()).toEqual(year)
      expect(actualDate.getMonth()).toEqual(month - 1)
      expect(actualDate.getDate()).toEqual(day)
    })
  })

  describe('last-week', () => {
    test.each`
      weekday        | year    | month | day
      ${'monday'}    | ${2020} | ${12} | ${21}
      ${'tuesday'}   | ${2020} | ${12} | ${22}
      ${'wednesday'} | ${2020} | ${12} | ${23}
      ${'thursday'}  | ${2020} | ${12} | ${24}
      ${'friday'}    | ${2020} | ${12} | ${25}
      ${'saturday'}  | ${2020} | ${12} | ${26}
      ${'sunday'}    | ${2020} | ${12} | ${27}
    `('should return $year/$month/$day for $weekday', ({ weekday, year, month, day }) => {
      const actualDate = getDateForWeekdayOf(weekday, 'last-week')

      expect(actualDate.getUTCFullYear()).toEqual(year)
      expect(actualDate.getMonth()).toEqual(month - 1)
      expect(actualDate.getDate()).toEqual(day)
    })
  })

  describe('next-week', () => {
    test.each`
      weekday        | year    | month | day
      ${'monday'}    | ${2021} | ${1}  | ${4}
      ${'tuesday'}   | ${2021} | ${1}  | ${5}
      ${'wednesday'} | ${2021} | ${1}  | ${6}
      ${'thursday'}  | ${2021} | ${1}  | ${7}
      ${'friday'}    | ${2021} | ${1}  | ${8}
      ${'saturday'}  | ${2021} | ${1}  | ${9}
      ${'sunday'}    | ${2021} | ${1}  | ${10}
    `('should return $year/$month/$day for $weekday', ({ weekday, year, month, day }) => {
      const actualDate = getDateForWeekdayOf(weekday, 'next-week')

      expect(actualDate.getUTCFullYear()).toEqual(year)
      expect(actualDate.getMonth()).toEqual(month - 1)
      expect(actualDate.getDate()).toEqual(day)
    })
  })
})
