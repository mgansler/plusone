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
})
