import {
  createContext,
  Dispatch,
  ReactNode,
  Reducer,
  ReducerAction,
  useContext,
  useReducer,
} from 'react'

export enum DefaultGroups {
  AllUnread = 'AllUnread',
}

interface ContextState {
  selectedGroup?: string
  selectedFeeds: string[]
}

interface ContextValue extends ContextState {
  select: Dispatch<ReducerAction<typeof reducer>>
}

const defaultValue: ContextValue = {
  selectedGroup: DefaultGroups.AllUnread,
  selectedFeeds: [],
  select: (action) => undefined,
}

export enum SelectionType {
  Feed,
  Group,
}

type SelectFeed = {
  type: SelectionType.Feed
  payload: string
}

type SelectGroup = {
  type: SelectionType.Group
  payload: {
    groupId: string
    feedIds: string[]
  }
}

const Context = createContext<ContextValue>(defaultValue)

const reducer: Reducer<ContextState, SelectFeed | SelectGroup> = (
  state,
  action,
) => {
  switch (action.type) {
    case SelectionType.Feed:
      return {
        selectedGroup: undefined,
        selectedFeeds: [action.payload],
      }
    case SelectionType.Group:
      return {
        selectedGroup: action.payload.groupId,
        selectedFeeds: action.payload.feedIds,
      }
    default:
      return state
  }
}

type SelectedFeedsProviderProps = {
  children: ReactNode
}

export function SelectedFeedsProvider({
  children,
}: SelectedFeedsProviderProps) {
  const [state, select] = useReducer(reducer, defaultValue)

  return (
    <Context.Provider value={{ ...state, select }}>{children}</Context.Provider>
  )
}

export const useSelectedFeeds = () => useContext<ContextValue>(Context)
