export { CheatSheet } from './CheatSheet'
export { NewFeed } from './NewFeed'
export { NewGroup } from './NewGroup'

export enum ModalIdentifier {
  None,
  CheatCheat,
  NewFeed,
  NewGroup,
}

export interface Modal {
  isOpen: boolean
  open: () => void
  close: () => void
}
