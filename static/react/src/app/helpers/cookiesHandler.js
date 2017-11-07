import {Redirect} from 'react-router';
import {COOKIEEXPIRETIMEINDAYS} from './env.js';


export const cookieObj = {
  storeCookies: function(userDetail) {
	  var now = new Date();
	    var exp = new Date(now.getTime() + COOKIEEXPIRETIMEINDAYS*24*60*60*1000);
	   var expires =  exp.toUTCString();
      document.cookie = "userToken="+userDetail.token+"; "+"expires="+expires;
      document.cookie = "userName="+userDetail.user.username+"; "+"expires="+expires;;
      document.cookie = "email="+userDetail.user.email+"; "+"expires="+expires;;
      document.cookie = "date="+userDetail.user.date_joined+"; "+"expires="+expires;;
      document.cookie = "phone="+userDetail.profile.phone+"; "+"expires="+expires;;
      document.cookie = "last_login="+userDetail.user.last_login+"; "+"expires="+expires;;
      document.cookie = "is_superuser="+userDetail.user.is_superuser+"; "+"expires="+expires;;
      document.cookie = "image_url="+userDetail.profile.image_url+"; "+"expires="+expires;;
  },

  clearCookies: function() {
	  var now = new Date();
	  var exp = new Date(now.getTime());
	   var expires =  exp.toUTCString();
      document.cookie = "userToken=;"+"; "+"expires="+expires;
      document.cookie = "userName=;"+"; "+"expires="+expires;;
      document.cookie = "email=;"+"; "+"expires="+expires;;
      document.cookie = "date=;"+"; "+"expires="+expires;;
      document.cookie = "phone=;"+"; "+"expires="+expires;;
      document.cookie = "last_login=;"+"; "+"expires="+expires;;
      document.cookie = "is_superuser=;"+"; "+"expires="+expires;;
      document.cookie = "image_url=;"+"; "+"expires="+expires;;
      location.reload();
  }
}
