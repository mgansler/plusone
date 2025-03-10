import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useReducer } from 'react'

import { useLocalStorage } from '@plusone/hooks'

import { dinnerPlanReducer } from './reducer'
import type { DinnerPlanActions, DinnerPlanState, Dish } from './types'

const defaultState: DinnerPlanState = {
  plan: {},
  dishes: [],
}

type DinnerPlanStoreContext = {
  state: DinnerPlanState
  dispatch: (action: DinnerPlanActions) => void
}

const Context = createContext<DinnerPlanStoreContext | undefined>(undefined)

type DinnerPlanStoreProps = {
  children: ReactNode
}

export function DinnerPlanStore({ children }: DinnerPlanStoreProps) {
  const [initialState = defaultState, storeState] = useLocalStorage<DinnerPlanState>({ key: 'dinner-plan' })

  const [state, dispatch] = useReducer(dinnerPlanReducer, initialState)

  useEffect(() => storeState(state), [state, storeState])

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
