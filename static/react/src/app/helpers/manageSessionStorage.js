export const sessionObject = {
  manageSession: function() {
    if (typeof(Storage) !== "undefined") {
      let allCookies = document.cookie.split(";");
      let userDetail = {};
      for(let i=0;i<allCookies.length;i++){
    	  let cur = allCookies[i].split('=');
    	  userDetail[cur[0].replace(/\s/g, '')] = cur[1];
      }
      sessionStorage.userToken = userDetail.userToken;
      sessionStorage.userName = userDetail.userName;
      sessionStorage.email = userDetail.email;
      sessionStorage.date = userDetail.date;
      sessionStorage.phone = userDetail.phone;
      sessionStorage.last_login = userDetail.last_login;
      sessionStorage.is_superuser = userDetail.is_superuser;
      sessionStorage.image_url = userDetail.image_url;

    }
  },

  clearSession: function() {
    if (typeof(Storage) !== "undefined") {
      sessionStorage.clear();
    }
  }
}
