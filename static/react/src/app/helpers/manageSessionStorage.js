export const sessionObject={
manageSession: function(userDetail){
    if (typeof(Storage) !== "undefined") {
     sessionStorage.userToken = userDetail.token;
     sessionStorage.userId = userDetail.userId;
     sessionStorage.username = userDetail.username;
   }
 },

clearSession: function(){
    if (typeof(Storage) !== "undefined") {
     sessionStorage.clear();
   }
  }
}
