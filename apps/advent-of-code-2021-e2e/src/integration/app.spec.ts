describe('advent-of-code-2021', () => {
  beforeEach(() => cy.visit('/'))

  it('should display welcome message', () => {
    cy.document().title().should('eq', 'Advent of Code 2021')
  })

  it('should solve day 1', () => {
    cy.findByRole('link', { name: '01' }).click()
    cy.findByRole('textbox').type(
      '199{enter}200{enter}208{enter}210{enter}200{enter}207{enter}240{enter}269{enter}260{enter}263',
    )

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 7')
    cy.findByText('Solution (Part 2): 5')
  })

  it('should solve day 2', () => {
    cy.findByRole('link', { name: '02' }).click()
    cy.findByRole('textbox').type('forward 5{enter}down 5{enter}forward 8{enter}up 3{enter}down 8{enter}forward 2')

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 150')
    cy.findByText('Solution (Part 2): 900')
  })

  it('should solve day 3', () => {
    cy.findByRole('link', { name: '03' }).click()
    cy.findByRole('textbox').type(
      '00100{enter}11110{enter}10110{enter}10111{enter}10101{enter}01111{enter}00111{enter}11100{enter}10000{enter}11001{enter}00010{enter}01010',
    )

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 198')
    cy.findByText('Solution (Part 2): 230')
  })

  it('should solve day 4', () => {
    cy.findByRole('link', { name: '04' }).click()
    cy.findByRole('textbox').type('7,4,9,5,11,17,23,2,0,14,21,24,10,16,13,6,15,25,12,22,18,20,8,19,3,26,1')
    cy.findByRole('textbox').type('{enter}{enter}')
    cy.findByRole('textbox').type(
      '22 13 17 11  0{enter} 8  2 23  4 24{enter}21  9 14 16  7{enter} 6 10  3 18  5{enter} 1 12 20 15 19',
    )
    cy.findByRole('textbox').type('{enter}{enter}')
    cy.findByRole('textbox').type(
      ' 3 15  0  2 22{enter} 9 18 13 17  5{enter}19  8  7 25 23{enter}20 11 10 24  4{enter}14 21 16 12  6',
    )
    cy.findByRole('textbox').type('{enter}{enter}')
    cy.findByRole('textbox').type(
      '14 21 17 24  4{enter}10 16 15  9 19{enter}18  8 23 26 20{enter}22 11 13  6  5{enter} 2  0 12  3  7',
    )

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 4512')
    cy.findByText('Solution (Part 2): 1924')
  })

  it('should solve day 5', () => {
    cy.findByRole('link', { name: '05' }).click()
    cy.findByRole('textbox').type(
      '0,9 -> 5,9{enter}8,0 -> 0,8{enter}9,4 -> 3,4{enter}2,2 -> 2,1{enter}7,0 -> 7,4{enter}6,4 -> 2,0{enter}0,9 -> 2,9{enter}3,4 -> 1,4{enter}0,0 -> 8,8{enter}5,5 -> 8,2',
    )

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 5')
    cy.findByText('Solution (Part 2): 12')
  })

  it('should solve day 6', () => {
    cy.findByRole('link', { name: '06' }).click()
    cy.findByRole('textbox').type('3,4,3,1,2')

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 5934')
    cy.findByText('Solution (Part 2): 26984457539')
  })

  it('should solve day 7', () => {
    cy.findByRole('link', { name: '07' }).click()
    cy.findByRole('textbox').type('16,1,2,0,4,2,7,1,2,14')

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 37')
    cy.findByText('Solution (Part 2): 168')
  })

  it('should solve day 8', () => {
    cy.findByRole('link', { name: '08' }).click()
    cy.findByRole('textbox').type(
      'be cfbegad cbdgef fgaecd cgeb fdcge agebfd fecdb fabcd edb | fdgacbe cefdb cefbgd gcbe',
    )
    cy.findByRole('textbox').type('{enter}')
    cy.findByRole('textbox').type('edbfga begcd cbg gc gcadebf fbgde acbgfd abcde gfcbed gfec | fcgedb cgb dgebacf gc')
    cy.findByRole('textbox').type('{enter}')
    cy.findByRole('textbox').type('fgaebd cg bdaec gdafb agbcfd gdcbef bgcad gfac gcb cdgabef | cg cg fdcagb cbg')
    cy.findByRole('textbox').type('{enter}')
    cy.findByRole('textbox').type('fbegcd cbd adcefb dageb afcb bc aefdc ecdab fgdeca fcdbega | efabcd cedba gadfec cb')
    cy.findByRole('textbox').type('{enter}')
    cy.findByRole('textbox').type('aecbfdg fbg gf bafeg dbefa fcge gcbea fcaegb dgceab fcbdga | gecf egdcabf bgf bfgea')
    cy.findByRole('textbox').type('{enter}')
    cy.findByRole('textbox').type(
      'fgeab ca afcebg bdacfeg cfaedg gcfdb baec bfadeg bafgc acf | gebdcfa ecba ca fadegcb',
    )
    cy.findByRole('textbox').type('{enter}')
    cy.findByRole('textbox').type(
      'dbcfg fgd bdegcaf fgec aegbdf ecdfab fbedc dacgb gdcebf gf | cefg dcbef fcge gbcadfe',
    )
    cy.findByRole('textbox').type('{enter}')
    cy.findByRole('textbox').type('bdfegc cbegaf gecbf dfcage bdacg ed bedf ced adcbefg gebcd | ed bcgafe cdgba cbgef')
    cy.findByRole('textbox').type('{enter}')
    cy.findByRole('textbox').type('egadfb cdbfeg cegd fecab cgb gbdefca cg fgcdab egfdb bfceg | gbdfcae bgc cg cgb')
    cy.findByRole('textbox').type('{enter}')
    cy.findByRole('textbox').type('gcafb gcf dcaebfg ecagb gf abcdeg gaef cafbge fdbac fegbdc | fgae cfgab fg bagce')

    cy.findByRole('button', { name: 'Solution!' }).click()

    cy.findByText('Solution (Part 1): 26')
    cy.findByText('Solution (Part 2): 61229')
  })
})
