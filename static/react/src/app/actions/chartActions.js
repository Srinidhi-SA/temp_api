
export function chartObjStore(chartObj) {
	return {
		type: "CHART_OBJECT",
		chartObj
	}
}
export function chartdate(chartdate) {
	return {
		type: "C3_DATE",
		chartdate
	}
}
