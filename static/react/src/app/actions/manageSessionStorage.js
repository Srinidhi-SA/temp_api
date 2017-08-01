export default function (userDetail){
  if (typeof(Storage) !== "undefined") {
   sessionStorage.userToken = userDetail.token;
   sessionStorage.userId = userDetail.userId;
 }
}
