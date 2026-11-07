/** Viewport width (px) up to which the mobile layout is used */
export const MOBILE_MAX_WIDTH = 768

/** Height of the app topbar; full-height overlays start below it */
export const TOPBAR_HEIGHT = 48

/**
 * Stacking order of layout overlays. Leaflet's panes stay below all of them, because the map
 * creates its own stacking context.
 */
export const Z_INDEX = {
  sheetBackdrop: 1400,
  sheet: 1500,
  floatingButton: 1600,
  dropdown: 2000,
} as const
