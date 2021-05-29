import { DinnerPlanState } from './types'
import { dinnerPlanReducer } from './reducer'
import { AddDish, PlanDish, RemoveDish } from './actions'

describe('reducer', () => {
  const initialState = Object.freeze<DinnerPlanState>({
    dishes: ['spaghetti'],
    plan: { '2021.01.Monday': 'spaghetti' },
  })

  describe('add-dish', () => {
    it('should add a new dish', () => {
      const action: AddDish = {
        type: 'add-dish',
        payload: 'risotto',
      }

      const expectedState: DinnerPlanState = {
        ...initialState,
        dishes: ['risotto', 'spaghetti'],
      }

      const actualState = dinnerPlanReducer(initialState, action)

      expect(actualState).toEqual(expectedState)
    })

    it('should sort when adding a new dish', () => {
      const action: AddDish = {
        type: 'add-dish',
        payload: 'risotto',
      }

      const unsortedInitialState: DinnerPlanState = {
        plan: {},
        dishes: ['a', 'z', 'y', 'b'],
      }

      const expectedState: DinnerPlanState = {
        plan: {},
        dishes: ['a', 'b', 'risotto', 'y', 'z'],
      }

      const actualState = dinnerPlanReducer(unsortedInitialState, action)

      expect(actualState).toEqual(expectedState)
    })

    it('should not add a duplicate', () => {
      const action: AddDish = {
        type: 'add-dish',
        payload: 'spaghetti',
      }

      const expectedState: DinnerPlanState = initialState

      const actualState = dinnerPlanReducer(initialState, action)

      expect(actualState).toEqual(expectedState)
    })
  })

  describe('plan-dish', () => {
    it('should add a new dish to the plan', () => {
      const action: PlanDish = {
        type: 'plan-dish',
        payload: {
          year: '2021',
          week: '01',
          weekday: 'Tuesday',
          dish: 'spaghetti',
        },
      }

      const expectedState: DinnerPlanState = {
        ...initialState,
        plan: {
          '2021.01.Monday': 'spaghetti',
          '2021.01.Tuesday': 'spaghetti',
        },
      }

      const actualState = dinnerPlanReducer(initialState, action)

      expect(actualState).toEqual(expectedState)
    })

    it('should overwrite the plan', () => {
      const action: PlanDish = {
        type: 'plan-dish',
        payload: {
          year: '2021',
          week: '01',
          weekday: 'Monday',
          dish: 'risotto',
        },
      }

      const expectedState: DinnerPlanState = {
        ...initialState,
        plan: { '2021.01.Monday': 'risotto' },
      }

      const actualState = dinnerPlanReducer(initialState, action)

      expect(actualState).toEqual(expectedState)
    })
  })

  describe('remove-dish', () => {
    it('should remove the dish', () => {
      const action: RemoveDish = {
        type: 'remove-dish',
        payload: 'spaghetti',
      }

      const expectedState: DinnerPlanState = {
        ...initialState,
        dishes: [],
      }

      const actualState = dinnerPlanReducer(initialState, action)

      expect(actualState).toEqual(expectedState)
    })

    it('should not care about dishes that are not in the list', () => {
      const action: RemoveDish = {
        type: 'remove-dish',
        payload: 'risotto',
      }

      const expectedState: DinnerPlanState = initialState

      const actualState = dinnerPlanReducer(initialState, action)

      expect(actualState).toEqual(expectedState)
    })
  })
})
