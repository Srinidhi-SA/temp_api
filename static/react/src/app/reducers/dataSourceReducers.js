export default function reducer(state = {
		dataSourceList:{},
		fileUpload:{},
		selectedDataSrcType:"fileUpload",
		db_host:null,
		db_schema:null,
		db_port:null,
		db_username:null,
		db_tablename:null,
		db_password:null,
}, action) {
	if(window.location.href.includes("autoML")){
	$("#left-tabs-example-tab-MySQL").css("cursor", "not-allowed");
	$("#left-tabs-example-tab-mssql").css("cursor", "not-allowed");
	$("#left-tabs-example-tab-Hana").css("cursor", "not-allowed");
	$("#left-tabs-example-tab-Hdfs").css("cursor", "not-allowed");
	$("#left-tabs-example-tab-S3").css("cursor", "not-allowed");
	}
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
	case "DATA_UPLOAD_FILE":
	{
		return {
			...state,
			fileUpload:action.files[0],
		}
	}
	break;
	case "DB_HOST_NAME":
	{
		return {
			...state,
			db_host:action.host,
		}
	}
	break;
	case "DB_PORT_NAME":
	{
		return {
			...state,
			db_port:action.port,
		}
	}
	break;
	case "DB_USER_NAME":
	{
		return {
			...state,
			db_username:action.username,
		}
	}
	break;
	case "DB_PASSWORD":
	{
		return {
			...state,
			db_password:action.password,
		}
	}
	break;
	case "DB_TABLENAME":
	{
		return {
			...state,
			db_tablename:action.tablename
		}
	}
	break;
	case "DB_SCHEMA":
	{
		return {
			...state,
			db_schema:action.schema,
		}
	}
	break;
	case "CLEAR_DATA_UPLOAD_FILE":
	{
		return {
			...state,
			fileUpload:{},
		}
	}
	break;
	}
	return state
}
