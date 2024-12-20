import type { AddDish, PlanDish, RemoveDish } from './actions'

export type Dish = string

export type DinnerPlanState = {
  plan: Record<string, Dish>
  dishes: Array<Dish>
}

export type DinnerPlanActions = AddDish | PlanDish | RemoveDish
