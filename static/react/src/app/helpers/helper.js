export function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
}
const FILEUPLOAD = "File Upload";
const MYSQL = "MySQL";
const INPUT = "Input";
const PASSWORD = "Password";

export{
	FILEUPLOAD,
	MYSQL,
	INPUT,
	PASSWORD
	}
