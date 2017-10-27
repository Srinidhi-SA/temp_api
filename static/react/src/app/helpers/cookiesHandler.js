import {Redirect} from 'react-router';
export const cookieObj = {
  storeCookies: function(userDetail) {
	  var now = new Date();
	    var exp = new Date(now.getTime() + 1*24*60*60*1000);
	   var expires =  exp.toUTCString();
      document.cookie = "userToken="+userDetail.token+"; "+"expires="+expires;
      document.cookie = "userName="+userDetail.user.username;
      document.cookie = "email="+userDetail.user.email;
      document.cookie = "date="+userDetail.user.date_joined;
      document.cookie = "phone="+userDetail.profile.phone;
      document.cookie = "last_login="+userDetail.user.last_login;
      document.cookie = "is_superuser="+userDetail.user.is_superuser;
      document.cookie = "image_url="+userDetail.profile.image_url;
  },

  clearCookies: function() {
	  var now = new Date();
	  var exp = new Date(now.getTime());
	   var expires =  exp.toUTCString();
      document.cookie = "userToken=;"+"; "+"expires="+expires;;
      document.cookie = "userName=;";
      document.cookie = "email=;";
      document.cookie = "date=;";
      document.cookie = "phone=;";
      document.cookie = "last_login=;";
      document.cookie = "is_superuser=;";
      document.cookie = "image_url=;";
      location.reload();
  }
}
