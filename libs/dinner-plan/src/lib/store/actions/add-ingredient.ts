import { DinnerPlanActions, DinnerPlanState, Ingredient } from '../types'

export type AddIngredient = {
  type: 'add-ingredient'
  payload: Ingredient
}

export function addIngredient(state: DinnerPlanState, action: DinnerPlanActions): DinnerPlanState {
  return { ...state, ingredients: Array.from(new Set([...state.ingredients, action.payload])) as Ingredient[] }
}
