export function openBinsOrLevelsModalAction(selectedItem) {
  return {
    type: "BINS_LEVELS_SHOW_MODAL",
    selectedItem
  }
}



export function closeBinsOrLevelsModalAction() {

   return {

       type: "BINS_LEVELS_HIDE_MODAL",

   }

}



export function openTransformColumnModalAction() {

    return {

           type: "TRANSFORM_COLUMN_SHOW_MODAL",

       }

}



export function closeTransformColumnModalAction() {

   return {

       type: "TRANSFORM_COLUMN_HIDE_MODAL",

   }

}



export function selectedBinsOrLevelsTabAction(selectedBinsOrLevelsTab) {

    return {

           type: "BINS_OR_LEVELS",

           selectedBinsOrLevelsTab

       }

}
