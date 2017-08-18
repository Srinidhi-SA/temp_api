export const sessionObject={
manageSession: function(userDetail){
    if (typeof(Storage) !== "undefined") {
     sessionStorage.userToken = userDetail.token;
    sessionStorage.userName = userDetail.user.username;

   }
 },

clearSession: function(){
    if (typeof(Storage) !== "undefined") {
     sessionStorage.clear();
   }
  }
}
