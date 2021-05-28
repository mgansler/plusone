import { DinnerPlanActions, DinnerPlanState } from './types'
import { addDish, addIngredient, planDish } from './actions'

export function dinnerPlanReducer(state: DinnerPlanState, action: DinnerPlanActions): DinnerPlanState {
  switch (action.type) {
    case 'add-dish':
      return addDish(state, action)
    case 'add-ingredient':
      return addIngredient(state, action)
    case 'plan-dish':
      return planDish(state, action)
    default:
      return state
  }
}
