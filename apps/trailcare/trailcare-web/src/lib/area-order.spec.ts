import { applyAreaOrder, moveArea } from './area-order'

const areas = [{ id: 1 }, { id: 2 }, { id: 3 }]

describe('applyAreaOrder', () => {
  it('keeps the given order without a stored one', () => {
    expect(applyAreaOrder(areas, [])).toEqual(areas)
  })

  it('sorts by the stored order and appends new areas, ignoring deleted ones', () => {
    expect(applyAreaOrder(areas, [3, 99, 1])).toEqual([{ id: 3 }, { id: 1 }, { id: 2 }])
  })
})

describe('moveArea', () => {
  it('swaps with the neighbour and returns the full order', () => {
    expect(moveArea(areas, [], 2, 'up')).toEqual([2, 1, 3])
    expect(moveArea(areas, [3, 1, 2], 1, 'down')).toEqual([3, 2, 1])
  })

  it('does nothing at the ends or for unknown areas', () => {
    expect(moveArea(areas, [], 1, 'up')).toBeUndefined()
    expect(moveArea(areas, [], 3, 'down')).toBeUndefined()
    expect(moveArea(areas, [], 42, 'down')).toBeUndefined()
  })
})
