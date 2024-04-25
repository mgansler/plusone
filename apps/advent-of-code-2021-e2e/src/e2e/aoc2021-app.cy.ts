const TIMEOUT = 10_000

describe('advent-of-code-2021', () => {
  it('should display welcome message', () => {
    cy.visit('/')
    cy.document().title().should('eq', 'Advent of Code 2021')
  })

  it.skip('should solve day 1', () => {
    cy.visit('/days/01')
    cy.fixture('01.txt').then((input) => cy.findByRole('textbox', { timeout: TIMEOUT }).type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 7')
    cy.findByText('Solution (Part 2): 5')
  })

  it.skip('should solve day 2', () => {
    cy.visit('/days/02')
    cy.fixture('02.txt').then((input) => cy.findByRole('textbox', { timeout: TIMEOUT }).type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 150')
    cy.findByText('Solution (Part 2): 900')
  })

  it.skip('should solve day 3', () => {
    cy.visit('/days/03')
    cy.fixture('03.txt').then((input) => cy.findByRole('textbox', { timeout: TIMEOUT }).type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 198')
    cy.findByText('Solution (Part 2): 230')
  })

  it.skip('should solve day 4', () => {
    cy.visit('/days/04')
    cy.fixture('04.txt').then((input) => cy.findByRole('textbox', { timeout: TIMEOUT }).type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 4512')
    cy.findByText('Solution (Part 2): 1924')
  })

  it.skip('should solve day 5', () => {
    cy.visit('/days/05')
    cy.fixture('05.txt').then((input) => cy.findByRole('textbox', { timeout: TIMEOUT }).type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 5')
    cy.findByText('Solution (Part 2): 12')
  })

  it.skip('should solve day 6', () => {
    cy.visit('/days/06')
    cy.fixture('06.txt').then((input) => cy.findByRole('textbox', { timeout: TIMEOUT }).type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 5934')
    cy.findByText('Solution (Part 2): 26984457539')
  })

  it.skip('should solve day 7', () => {
    cy.visit('/days/07')
    cy.fixture('07.txt').then((input) => cy.findByRole('textbox', { timeout: TIMEOUT }).type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 37')
    cy.findByText('Solution (Part 2): 168')
  })

  it.skip('should solve day 8', () => {
    cy.visit('/days/08')
    cy.fixture('08.txt').then((input) => cy.findByRole('textbox', { timeout: TIMEOUT }).type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 26')
    cy.findByText('Solution (Part 2): 61229')
  })

  it.skip('should solve day 9', () => {
    cy.visit('/days/09')
    cy.fixture('09.txt').then((input) => cy.findByRole('textbox', { timeout: TIMEOUT }).type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 15')
    cy.findByText('Solution (Part 2): 1134')
  })

  it.skip('should solve day 10', () => {
    cy.visit('/days/10')
    cy.fixture('10.txt').then((input) =>
      cy.findByRole('textbox', { timeout: TIMEOUT }).type(input, { parseSpecialCharSequences: false }),
    )

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 26397')
    cy.findByText('Solution (Part 2): 288957')
  })

  it.skip('should solve day 11', () => {
    cy.visit('/days/11')
    cy.fixture('11.txt').then((input) => cy.findByRole('textbox', { timeout: TIMEOUT }).type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 1656')
    cy.findByText('Solution (Part 2): 195')
  })

  it.skip('should solve day 12', () => {
    cy.visit('/days/12')
    cy.fixture('12.txt').then((input) => cy.findByRole('textbox', { timeout: TIMEOUT }).type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 226')
    cy.findByText('Solution (Part 2): 3509')
  })

  it.skip('should solve day 13', () => {
    cy.visit('/days/13')
    cy.fixture('13.txt').then((input) => cy.findByRole('textbox', { timeout: TIMEOUT }).type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 17')
    // No test for Part 2 because the output is visual
  })

  it.skip('should solve day 14', () => {
    cy.visit('/days/14')
    cy.fixture('14.txt').then((input) => cy.findByRole('textbox', { timeout: TIMEOUT }).type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 1588')
    cy.findByText('Solution (Part 2): 2188189693529')
  })

  it.skip('should solve day 15', () => {
    cy.visit('/days/15')
    cy.fixture('15.txt').then((input) => cy.findByRole('textbox', { timeout: TIMEOUT }).type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 40')
    cy.findByText('Solution (Part 2): 315')
  })
  ;[
    { transmission: '8A004A801A8002F478', versionSum: 16 },
    { transmission: '620080001611562C8802118E34', versionSum: 12 },
    { transmission: 'C0015000016115A2E0802F182340', versionSum: 23 },
    { transmission: 'A0016C880162017C3686B18A3D4780', versionSum: 31 },
  ].forEach(({ transmission, versionSum }) => {
    it.skip(`should solve day 16 - part 1 (${transmission} should produce ${versionSum})`, () => {
      cy.visit('/days/16')
      cy.findByRole('textbox', { timeout: TIMEOUT }).type(transmission)

      cy.findByRole('button', { name: 'Solution!' }).click()

      cy.findByText(`Solution (Part 1): ${versionSum}`)
    })
  })
  ;[
    { transmission: 'C200B40A82', result: 3 },
    { transmission: '04005AC33890', result: 54 },
    { transmission: '880086C3E88112', result: 7 },
    { transmission: 'CE00C43D881120', result: 9 },
    { transmission: 'D8005AC2A8F0', result: 1 },
    { transmission: 'F600BC2D8F', result: 0 },
    { transmission: '9C005AC2F8F0', result: 0 },
    { transmission: '9C0141080250320F1802104A08', result: 1 },
  ].forEach(({ transmission, result }) => {
    it.skip(`should solve day 16 - part 2 (${transmission} should produce ${result})`, () => {
      cy.visit('/days/16')
      cy.findByRole('textbox', { timeout: TIMEOUT }).type(transmission)

      cy.findByRole('button', { name: 'Solution!' }).click()

      cy.findByText(`Solution (Part 2): ${result}`)
    })
  })

  it.skip('should solve day 17', () => {
    cy.visit('/days/17')
    cy.fixture('17.txt').then((input) => cy.findByRole('textbox', { timeout: TIMEOUT }).type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 45')
    cy.findByText('Solution (Part 2): 112')
  })
})
