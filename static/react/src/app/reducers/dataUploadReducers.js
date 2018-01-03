export default function reducer(state = {
		dataUploadShowModal:false,
		imgUploadShowModal:false,
		showHideData:false,
}, action) {
	console.log("In DATA UPLOAD reducer!!");
	console.log(action);

	switch (action.type) {
	case "SHOW_MODAL":
	{
		return {
			...state,
			dataUploadShowModal:true,
		}
	}
	break;

	case "HIDE_MODAL":
	{
		return {
			...state,
			dataUploadShowModal:false,
		}
	}
	break;
	case "SHOW_IMG_MODAL":
	{
		return {
			...state,
			imgUploadShowModal:true,
		}
	}
	break;
	case "HIDE_IMG_MODAL":
	{
		return {
			...state,
			imgUploadShowModal:false,
		}
	}
	break;

	case "UPDATE_HIDE_DATA":
	{
		return{
			...state,
			showHideData:action.flag
		}
	}
	break;

 }
return state
}
