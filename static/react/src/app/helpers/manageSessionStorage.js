export const sessionObject = {
  manageSession: function(userDetail) {
    if (typeof(Storage) !== "undefined") {
      let phone = ""
      sessionStorage.userToken = userDetail.token;
      sessionStorage.userName = userDetail.user.username;
      sessionStorage.email = userDetail.user.email;
      sessionStorage.date = userDetail.user.date_joined;
     /* sessionStorage.phone = userDetail.profile.phone;
      sessionStorage.last_login = userDetail.user.last_login;
      sessionStorage.is_superuser = userDetail.user.is_superuser;
      sessionStorage.image_url = userDetail.profile.image_url;*/

    }
  },

  clearSession: function() {
    if (typeof(Storage) !== "undefined") {
      sessionStorage.clear();
    }
  }
}
