import { DinnerPlanState, Dish } from '../types'

export type RemoveDish = {
  type: 'remove-dish'
  payload: Dish
}

export function removeDish(state: DinnerPlanState, action: RemoveDish): DinnerPlanState {
  return { ...state, dishes: state.dishes.filter((name) => action.payload !== name) }
}
