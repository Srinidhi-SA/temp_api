export default function reducer(state = {
	dataSourceList:{},
	fileUpload:{},
	selectedDataSrcType:null,
	db_Host:null,
	db_Schema:null,
	db_Port:null,
	db_Username:null,
	db_Tablename:null,
	db_Password:null,
}, action) {
	console.log("In DATA Source reducer!!");
	console.log(action.files);

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
	case "DATA_SOURCE_SELECTED_TYPE":
	{
		return {
			...state,
			selectedDataSrcType:action.selectedDataSrcType,
		}
	}
	break;
	case "MYSQL_DETAILS":
	{
		return {
			...state,
			db_Host:action.host,
			db_Schema:action.schema,
			db_Port:action.port,
			db_Username:action.username,
			db_Password:action.password,
			db_Tablename:action.tablename
		}
	}
	break;
 }
return state
}
