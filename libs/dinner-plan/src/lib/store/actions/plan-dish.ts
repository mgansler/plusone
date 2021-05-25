import { DinnerPlanState, Dish } from '../types'

export type PlanDish = {
  type: 'plan-dish'
  payload: {
    year: string
    week: string
    weekday: string
    dish: Dish
  }
}

export function planDish(state: DinnerPlanState, action: PlanDish): DinnerPlanState {
  const { year, week, weekday } = action.payload
  return {
    ...state,
    plan: { ...state.plan, [[year, week, weekday].join('.')]: action.payload.dish },
  }
}
