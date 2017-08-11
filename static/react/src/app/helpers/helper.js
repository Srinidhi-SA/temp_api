export function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
}
const FILEUPLOAD = "fileUpload";
const MYSQL = "MySQL";
const INPUT = "Input";
const HOST = "Host";
const PORT = "Port";
const SCHEMA = "Schema";
const USERNAME = "Username";
const PASSWORD = "Password";
const TABLENAME = "Table Name"

export{
	FILEUPLOAD,
	MYSQL,
	INPUT,
	PASSWORD,
	HOST,
	PORT,
	SCHEMA,
	USERNAME,
	TABLENAME,
	}
