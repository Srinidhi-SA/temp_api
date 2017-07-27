var API = "http://34.196.204.54:9000";
var storyList=null;

export function getList(){
	fetch(API+'/api/errand/archived?userId=13',{
		method: 'get',
		headers: {
			'Authorization': 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ik1hcmxhYnNCSSIsInVzZXJfaWQiOjEzLCJlbWFpbCI6ImJpQG1hcmxhYnMuY29tIiwiZXhwIjoxNjAxMTQ0NTQzfQ.99L4gI6IBd2PlRwyCPNyiYDp-BFQQY7Fc_UfBio0vnY',
			'Content-Type': 'application/x-www-form-urlencoded'
		}})
		.then(function(response) {
			return response.json();
		}).then(function(json) {
			console.log(json);
			storyList =  json.errands;
		}).catch(function(err) {
			console.log(err);
		});
}


export function authenticate(mesg){
	alert(mesg);
	// fetch(API+'/user/api-token-auth',{
	// 	method: 'get',
	// 	headers: {
	// 		'Authorization': '',
	// 		'Content-Type': 'application/x-www-form-urlencoded'
	// 	},
	// 	body: JSON.stringify({
	// 			username: 'harman',
	// 			password: 'password123',
  //    })
	// })
	// 	.then(function(response) {
	// 		//return response.json();
	// 		alert(mesg);
	// 	}).then(function(json) {
	// 		alert(mesg);
	// 		console.log(json);
	// 	}).catch(function(err) {
	// 		console.log(err);
	// 	});
}
