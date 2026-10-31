import { CareType } from '@plusone/trailcare-api-client'

export const CARE_TYPE_LABEL: Record<CareType, string> = {
  [CareType.SWEPT]: 'Gefegt',
  [CareType.CUT_BACK]: 'Freigeschnitten',
  [CareType.REPAIR]: 'Repariert',
  [CareType.INSPECTION]: 'Kontrolliert',
  [CareType.FALLEN_TREE]: 'Baum im Trail',
}

/** Wording for the confirmation toast, e.g. "Gefegt eingetragen: Klabuster" */
export const CARE_TYPE_DONE: Record<CareType, string> = {
  [CareType.SWEPT]: 'Gefegt eingetragen',
  [CareType.CUT_BACK]: 'Freischneiden eingetragen',
  [CareType.REPAIR]: 'Reparatur eingetragen',
  [CareType.INSPECTION]: 'Kontrolle eingetragen',
  [CareType.FALLEN_TREE]: 'Baum im Trail gemeldet',
}

export const CARE_TYPES: Array<CareType> = [
  CareType.SWEPT,
  CareType.CUT_BACK,
  CareType.REPAIR,
  CareType.INSPECTION,
  CareType.FALLEN_TREE,
]
