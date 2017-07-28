var API = "http://34.196.204.54:9000";

export function authenticateFunc(){
	let login_response={};

	fetch(API+'/api/user/api-token-auth',{
		method: 'POST',
		headers: {
	    'Content-Type': 'application/json',
    },
		body: JSON.stringify({
				username: 'harman',
				password: 'password123',
     })
	})
		.then(function(response) {
			console.log("working");
			//console.log(response.json());
			 return response.json();
		}).then(function(json) {
			login_response=json;
			console.log(login_response);
		}).catch(function(err) {
			console.log(err);
		});

    return{
      type:'AUTHENTICATE_USER',
      payload:login_response
    }
}
