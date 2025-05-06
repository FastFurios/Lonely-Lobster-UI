//-------------------------------------------------------------------
// UI BOXES DEFINITIONS
//-------------------------------------------------------------------
// last code cleaning: 15.12.2024

/**
 * Data structure for the size of an UI box
 */
export type UiBoxSize = {
    width:  number
    height: number
}

/**
 * Constants for sizing boxes
 */
/**
 * Box margin to window boundary (px) 
 */
export const UiBoxMarginToWindow  = 20   
/**
 * Height of header of the system UI (px)
 */
export const UiSystemHeaderHeight = 100  
/**
 * Height of worker statistics in the system UI
 */
export const UiWorkerStatsHeight  = 60  
/**
 * Height of worker names (px) 
 */
export const UiWorkerNameHeight   = 25  
/**
 * Header height of process steps (px) 
 */
export const UiPsHeaderHeight     = 25
/**
 * Header height of the output basket (px) 
 */
export const UiObHeaderHeight     = UiPsHeaderHeight   
/**
 * Value chain left margin (px)
 */
export const UiVcBoxLeftMargin    = 80
/**
 * Defines the portion of the height of an inventory box that should actually be used to show workitems: 1 = 100% is maximum  
 */
export const UiInventoryBoxHeightShrink = 1
/**
 * Portion of process step width for displaying inventory columns; remaining width reserved for flow arrow
 */
export const UiInvWidthOfPsWidth  = 0.8   
/**
 * Width of a inventory columns (px)
 */
export const UiInventoryColWidth  = 15

  