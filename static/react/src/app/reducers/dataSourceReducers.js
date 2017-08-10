export default function reducer(state = {
	dataSourceList:{},
}, action) {
	console.log("In DATA Source reducer!!");
	console.log(action);

	switch (action.type) {
	case "DATA_SOURCE_LIST":
	{
		return {
			...state,
			dataSourceList:action.dataSrcList,
		}
	}
  break;
	case "DATA_SOURCE_LIST_ERROR":
    {
      alert(action.json.non_field_errors);
      throw new Error("Unable to fetch data source list!!");
    }
    break;
 }
return state
}
