import { getYearFor } from './get-year-for'

describe('getYearFor', () => {
  describe('last-week', () => {
    test.each`
      year    | month | day  | expectedYear
      ${2021} | ${1}  | ${7} | ${2020}
      ${2021} | ${1}  | ${8} | ${2021}
    `(`should return $expectedYear for $year/$month/$day`, ({ expectedYear, year, month, day }) => {
      const date = new Date(Date.UTC(year, month - 1, day))
      const actualYear = getYearFor('last-week', date)

      expect(actualYear).toEqual(expectedYear)
    })
  })

  describe('next-week', () => {
    test.each`
      year    | month | day   | expectedYear
      ${2020} | ${12} | ${24} | ${2020}
      ${2020} | ${12} | ${25} | ${2021}
    `(`should return $expectedYear for $year/$month/$day`, ({ expectedYear, year, month, day }) => {
      const date = new Date(Date.UTC(year, month - 1, day))
      const actualYear = getYearFor('next-week', date)

      expect(actualYear).toEqual(expectedYear)
    })
  })
})
