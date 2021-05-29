import { DinnerPlanState, Dish } from '../types'

export type AddDish = {
  type: 'add-dish'
  payload: Dish
}

export function addDish(state: DinnerPlanState, action: AddDish): DinnerPlanState {
  return { ...state, dishes: Array.from(new Set([...state.dishes, action.payload])).sort() as Dish[] }
}
