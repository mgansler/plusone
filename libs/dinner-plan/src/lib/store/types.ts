import { Reducer } from 'react'

import { AddDish, PlanDish, RemoveDish } from './actions'

export type Dish = string

export type DinnerPlanState = {
  plan: Record<string, Dish>
  dishes: Dish[]
}

export type DinnerPlanActions = AddDish | PlanDish | RemoveDish

export type DinnerPlanReducer = Reducer<DinnerPlanState, DinnerPlanActions>
