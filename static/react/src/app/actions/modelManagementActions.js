export function openDeployModalAction(selectedItem) {
  return {
    type: "DEPLOY_SHOW_MODAL" ,
    selectedItem
  }
}

export function closeDeployModalAction() {
   return {
     type: "DEPLOY_HIDE_MODAL",
   }
}

// export function saveBinLevelTransformationValuesAction(coloumnSlug, actionType, userData){
//   return {
//     type: "SAVE_BIN_LEVEL_TRANSFORMATION_DATA",
//     coloumnSlug,
//     userData,
//     actionType
//   }
// }
export function openModelSummaryAction(summarySelected) {
  return {
    type: "SUMMARY_SELECTED_LIST" ,
    summarySelected
  }
}

export function handleAlgoDeleteAction(slug, dialog) {
  return (dispatch) => {
    showDialogBox(slug, dialog, dispatch, DELETEALGO, renderHTML(statusMessages("warning","Are you sure, you want to delete this model?","small_mascot")))
  }
}