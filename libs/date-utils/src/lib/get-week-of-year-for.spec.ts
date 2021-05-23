import { getWeekOfYearFor } from './get-week-of-year-for'
import { getDateFor } from './get-date-for'

describe('getWeekOfYear', () => {
  describe('this-week', () => {
    test.each`
      year    | month | day   | expectedWeek
      ${2020} | ${12} | ${27} | ${52}
      ${2020} | ${12} | ${28} | ${53}
      ${2021} | ${1}  | ${3}  | ${53}
      ${2021} | ${1}  | ${4}  | ${1}
      ${2021} | ${1}  | ${10} | ${1}
      ${2021} | ${1}  | ${11} | ${2}
    `('should return $expectedWeek for $year/$month/$day', ({ year, month, day, expectedWeek }) => {
      const date = new Date(Date.UTC(year, month - 1, day))
      const actualWeek = getWeekOfYearFor(getDateFor('this-week', date))

      expect(actualWeek).toEqual(expectedWeek)
    })
  })

  describe('last-week', () => {
    test.each`
      year    | month | day   | expectedYear
      ${2020} | ${12} | ${27} | ${51}
      ${2020} | ${12} | ${28} | ${52}
      ${2021} | ${1}  | ${3}  | ${52}
      ${2021} | ${1}  | ${4}  | ${53}
      ${2021} | ${1}  | ${10} | ${53}
      ${2021} | ${1}  | ${11} | ${1}
    `(`should return $expectedYear for $year/$month/$day`, ({ expectedYear, year, month, day }) => {
      const date = new Date(Date.UTC(year, month - 1, day))
      const actualYear = getWeekOfYearFor(getDateFor('last-week', date))

      expect(actualYear).toEqual(expectedYear)
    })
  })

  describe('next-week', () => {
    test.each`
      year    | month | day   | expectedYear
      ${2020} | ${12} | ${27} | ${53}
      ${2020} | ${12} | ${28} | ${1}
      ${2021} | ${1}  | ${3}  | ${1}
      ${2021} | ${1}  | ${4}  | ${2}
      ${2021} | ${1}  | ${10} | ${2}
      ${2021} | ${1}  | ${11} | ${3}
    `(`should return $expectedYear for $year/$month/$day`, ({ expectedYear, year, month, day }) => {
      const date = new Date(Date.UTC(year, month - 1, day))
      const actualYear = getWeekOfYearFor(getDateFor('next-week', date))

      expect(actualYear).toEqual(expectedYear)
    })
  })
})
