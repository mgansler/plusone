describe('advent-of-code-2021', () => {
  beforeEach(() => cy.visit('/'))

  it('should display welcome message', () => {
    cy.document().title().should('eq', 'Advent of Code 2021')
  })

  it('should solve day 1', () => {
    cy.findByRole('link', { name: '01' }).click()
    cy.fixture('01.txt').then((input) => cy.findByRole('textbox').type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 7')
    cy.findByText('Solution (Part 2): 5')
  })

  it('should solve day 2', () => {
    cy.findByRole('link', { name: '02' }).click()
    cy.fixture('02.txt').then((input) => cy.findByRole('textbox').type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 150')
    cy.findByText('Solution (Part 2): 900')
  })

  it('should solve day 3', () => {
    cy.findByRole('link', { name: '03' }).click()
    cy.fixture('03.txt').then((input) => cy.findByRole('textbox').type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 198')
    cy.findByText('Solution (Part 2): 230')
  })

  it('should solve day 4', () => {
    cy.findByRole('link', { name: '04' }).click()
    cy.fixture('04.txt').then((input) => cy.findByRole('textbox').type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 4512')
    cy.findByText('Solution (Part 2): 1924')
  })

  it('should solve day 5', () => {
    cy.findByRole('link', { name: '05' }).click()
    cy.fixture('05.txt').then((input) => cy.findByRole('textbox').type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 5')
    cy.findByText('Solution (Part 2): 12')
  })

  it('should solve day 6', () => {
    cy.findByRole('link', { name: '06' }).click()
    cy.fixture('06.txt').then((input) => cy.findByRole('textbox').type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 5934')
    cy.findByText('Solution (Part 2): 26984457539')
  })

  it('should solve day 7', () => {
    cy.findByRole('link', { name: '07' }).click()
    cy.fixture('07.txt').then((input) => cy.findByRole('textbox').type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 37')
    cy.findByText('Solution (Part 2): 168')
  })

  it('should solve day 8', () => {
    cy.findByRole('link', { name: '08' }).click()
    cy.fixture('08.txt').then((input) => cy.findByRole('textbox').type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 26')
    cy.findByText('Solution (Part 2): 61229')
  })

  it('should solve day 9', () => {
    cy.findByRole('link', { name: '09' }).click()
    cy.fixture('09.txt').then((input) => cy.findByRole('textbox').type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 15')
    cy.findByText('Solution (Part 2): 1134')
  })

  it('should solve day 10', () => {
    cy.findByRole('link', { name: '10' }).click()
    cy.fixture('10.txt').then((input) => cy.findByRole('textbox').type(input, { parseSpecialCharSequences: false }))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 26397')
    cy.findByText('Solution (Part 2): 288957')
  })

  it('should solve day 11', () => {
    cy.findByRole('link', { name: '11' }).click()
    cy.fixture('11.txt').then((input) => cy.findByRole('textbox').type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 1656')
    cy.findByText('Solution (Part 2): 195')
  })

  it('should solve day 12', () => {
    cy.findByRole('link', { name: '12' }).click()
    cy.fixture('12.txt').then((input) => cy.findByRole('textbox').type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 226')
    cy.findByText('Solution (Part 2): 3509')
  })

  it('should solve day 13', () => {
    cy.findByRole('link', { name: '13' }).click()
    cy.fixture('13.txt').then((input) => cy.findByRole('textbox').type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 17')
    // No test for Part 2 because the output is visual
  })

  it('should solve day 14', () => {
    cy.findByRole('link', { name: '14' }).click()
    cy.fixture('14.txt').then((input) => cy.findByRole('textbox').type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 1588')
    cy.findByText('Solution (Part 2): 2188189693529')
  })

  it('should solve day 15', () => {
    cy.findByRole('link', { name: '15' }).click()
    cy.fixture('15.txt').then((input) => cy.findByRole('textbox').type(input))

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
    it(`should solve day 16 - part 1 (${transmission} should produce ${versionSum})`, () => {
      cy.findByRole('link', { name: '16' }).click()
      cy.findByRole('textbox').type(transmission)

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
    it(`should solve day 16 - part 2 (${transmission} should produce ${result})`, () => {
      cy.findByRole('link', { name: '16' }).click()
      cy.findByRole('textbox').type(transmission)

      cy.findByRole('button', { name: 'Solution!' }).click()

      cy.findByText(`Solution (Part 2): ${result}`)
    })
  })

  it('should solve day 17', () => {
    cy.findByRole('link', { name: '17' }).click()
    cy.fixture('17.txt').then((input) => cy.findByRole('textbox').type(input))

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 45')
    cy.findByText('Solution (Part 2): 112')
  })
})
