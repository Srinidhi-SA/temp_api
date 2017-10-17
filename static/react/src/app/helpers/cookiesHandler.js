export const cookieObj = {
  storeCookies: function(userDetail) {
      document.cookie = "userToken="+userDetail.token;
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
      document.cookie = "userToken=;";
      document.cookie = "expires=" + now.toUTCString() + ";"
  }
}
