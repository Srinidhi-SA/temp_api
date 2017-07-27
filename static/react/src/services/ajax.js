var API = "http://34.196.204.54:9000";
var storyList = null;


export function getList(){
	return fetch(API+'/api/errand/archived?userId=13',{
		method: 'get',
		headers: {
			'Authorization': 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ik1hcmxhYnNCSSIsInVzZXJfaWQiOjEzLCJlbWFpbCI6ImJpQG1hcmxhYnMuY29tIiwiZXhwIjoxNjAxMTQ0NTQzfQ.99L4gI6IBd2PlRwyCPNyiYDp-BFQQY7Fc_UfBio0vnY',
			'Content-Type': 'application/x-www-form-urlencoded'
		}})
		.then(function(response) {
			return response.json();
		}).then(function(json) {
			storyList =  json.errands;
		}).catch(function(err) {
			console.log(err);
		});
}

export{
	storyList
};
export function authenticateFunc(){
	fetch(API+'/user/api-token-auth',{
		method: 'POST',
		body: JSON.stringify({
				username: 'harman',
				password: 'password123',
     })
	})
		.then(function(response) {
			return response.json();
		}).then(function(json) {
			//console.log(json);
		}).catch(function(err) {
			//console.log(err);
		});
}
