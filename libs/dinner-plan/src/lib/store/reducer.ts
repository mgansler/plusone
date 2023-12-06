import { addDish, planDish, removeDish } from './actions'
import type { DinnerPlanActions, DinnerPlanState } from './types'

export function dinnerPlanReducer(state: DinnerPlanState, action: DinnerPlanActions): DinnerPlanState {
  switch (action.type) {
    case 'add-dish':
      return addDish(state, action)
    case 'plan-dish':
      return planDish(state, action)
    case 'remove-dish':
      return removeDish(state, action)
    default:
      return state
  }
}
