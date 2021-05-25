import { createContext, ReactNode, useContext, useReducer } from 'react'

import { DinnerPlanActions, DinnerPlanReducer, DinnerPlanState, Dish } from './types'
import { dinnerPlanReducer } from './reducer'

const initialState: DinnerPlanState = {
  plan: {},
  dishes: [],
  ingredients: [],
}

interface DinnerPlanStoreContext {
  state: DinnerPlanState
  dispatch: (action: DinnerPlanActions) => void
}

const Context = createContext<DinnerPlanStoreContext>({ state: initialState, dispatch: () => undefined })

interface DinnerPlanStoreProps {
  children: ReactNode
}

export function DinnerPlanStore({ children }: DinnerPlanStoreProps) {
  const [state, dispatch] = useReducer<DinnerPlanReducer>(dinnerPlanReducer, initialState)
  return <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
}

export function useDinnerPlanStoreDispatch() {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error('useDinnerPlanStoreDispatch must be used within DinnerPlanStore')
  }

  return context.dispatch
}

type UseDishForDayProps = {
  week: string
  year: string
  weekday: string
}

export function useDishForDay({ year, week, weekday }: UseDishForDayProps): Dish {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error('useDishForDay must be used within DinnerPlanStore')
  }
  return context.state.plan[[year, week, weekday].join('.')]
}

export function useDishes() {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error('useDishes must be used within DinnerPlanStore')
  }

  return context.state.dishes
}

export function useIngredients() {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error('useIngredients must be used within DinnerPlanStore')
  }

  return context.state.ingredients
}
