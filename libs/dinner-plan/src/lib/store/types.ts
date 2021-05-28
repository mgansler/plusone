import { Reducer } from 'react'

import { AddDish, AddIngredient, PlanDish } from './actions'

export type Ingredient = string

export type Dish = {
  name: string
  ingredients: Ingredient[]
}

export type DinnerPlanState = {
  plan: Record<string, Dish>
  dishes: Dish[]
  ingredients: Ingredient[]
}

export type DinnerPlanActions = AddDish | AddIngredient | PlanDish

export type DinnerPlanReducer = Reducer<DinnerPlanState, DinnerPlanActions>
