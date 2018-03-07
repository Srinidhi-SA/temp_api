import {Redirect} from 'react-router';
import {COOKIEEXPIRETIMEINDAYS} from './env.js';


export const cookieObj = {
  storeCookies: function(userDetail) {
	  var now = new Date();
	    var exp = new Date(now.getTime() + COOKIEEXPIRETIMEINDAYS*24*60*60*1000);
	   var expires =  exp.toUTCString();
      if(userDetail.token)
      document.cookie = "userToken="+userDetail.token+"; "+"expires="+expires+"; path=/";
      document.cookie = "userName="+userDetail.user.username+"; "+"expires="+expires+"; path=/";
      document.cookie = "email="+userDetail.user.email+"; "+"expires="+expires+"; path=/";
      document.cookie = "date="+userDetail.user.date_joined+"; "+"expires="+expires+"; path=/";
      document.cookie = "phone="+userDetail.profile.phone+"; "+"expires="+expires+"; path=/";
      document.cookie = "last_login="+userDetail.user.last_login+"; "+"expires="+expires+"; path=/";
      document.cookie = "is_superuser="+userDetail.user.is_superuser+"; "+"expires="+expires+"; path=/";
      document.cookie = "image_url="+userDetail.profile.image_url+"; "+"expires="+expires+"; path=/";

  },

  clearCookies: function() {
	  var now = new Date();
	  var exp = new Date(now.getTime() - COOKIEEXPIRETIMEINDAYS*24*60*60*1000);
	   var expires =  exp.toUTCString();
      document.cookie = "userToken=;"+"; "+"expires="+expires+"; path=/";
      document.cookie = "userName=;"+"; "+"expires="+expires+"; path=/";
      document.cookie = "email=;"+"; "+"expires="+expires+"; path=/";
      document.cookie = "date=;"+"; "+"expires="+expires+"; path=/";
      document.cookie = "phone=;"+"; "+"expires="+expires+"; path=/";
      document.cookie = "last_login=;"+"; "+"expires="+expires+"; path=/";
      document.cookie = "is_superuser=;"+"; "+"expires="+expires+"; path=/";
      document.cookie = "image_url=;"+"; "+"expires="+expires+"; path=/";
      sessionStorage.clear();
      var noOfUrls = window.history.length;
      window.history.go("-"+noOfUrls-1);
      window.history.replaceState(null,null,"login");
  }
}
