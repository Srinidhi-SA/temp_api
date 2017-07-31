import React from "react";
import { connect } from "react-redux";
// import {authenticateFunc,getList,storyList} from "../../services/ajax.js";
import { authenticateFunc } from "../actions/loginActions";
import store from "../store";
import {Home} from "./home";
import $ from "jquery";

@connect((store) => {
  return {
    user: store.user.user,
    userFetched: store.user.fetched,
    tweets: store.tweets.tweets,
    login_response: store.login.login_response,
  };
})

export class Login extends React.Component {
   constructor(){
     super();
   }

  doAuth(){
      this.props.dispatch(authenticateFunc($("#username").val(),$("#password").val()))
  }
  render(){
    console.log("login is called!!")
console.log(this.props.login_response)
if (this.props.login_response.status == 200 && this.props.login_response.token != "") {
  console.log("authorized!!!");
  return (<Home/>);
}else{
    return(
      <div className="ma-splash-screen">
      <div className="ma-wrapper am-login">
       <div className="ma-content">
       <div className="main-content">

         <div className="login-container">
           <div className="panel panel-default">
             <div className="panel-heading"><img src="assets/images/m_adv_logo_text.png" alt="logo" className="logo-img" /></div>
             <div className="panel-body">

                 <h3>SIGN IN</h3>
                 <div className="login-form">
                   <div className="form-group">
                     <div className="input-group">
                       <input id="username" type="text" placeholder="Username" autoComplete="off" className="form-control"/><span className="input-group-addon"><i className="fa fa-user"></i></span>
                     </div>
                   </div>
                   <div className="form-group">
                     <div className="input-group">
                       <input id="password" type="password" placeholder="Password" className="form-control" />
                       <span className="input-group-addon"><i className="fa fa-key"></i></span>
                     </div>
                   </div>
          <div className="form-group footer row">
           <div className="col-xs-6 remember text-left">
                       <div className="ma-checkbox">
                         <input type="checkbox" id="remember" className="needsclick" />
                         <label htmlFor="remember"></label>
                       </div>
           <label htmlFor="remember">Remember Me</label>

                     </div>
                     <div className="col-xs-6 text-right"><a href="#">Forgot Password?</a></div>

                   </div>
                   <div className="form-group login-submit">
                     <button onClick={this.doAuth.bind(this)} className="btn btn-primary btn-lg">SIGN IN</button>
                   </div>

                 </div>
             </div>
           </div>
     </div>

       </div>
     </div>
   </div>
</div>


    );

  }
}

}
