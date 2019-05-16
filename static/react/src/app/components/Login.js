import React from "react";
import {connect} from "react-redux";
import {Redirect} from 'react-router';
// import {authenticateFunc,getList,storyList} from "../../services/ajax.js";
import {authenticateFunc,authenticateFuncSso} from "../actions/loginActions";
import store from "../store";
import {Link} from 'react-router-dom';
import {STATIC_URL} from "../helpers/env";
import {isEmpty,getUserDetailsOrRestart,USERDETAILS,removeChatbotOnLogout,hidechatbot} from "../helpers/helper";
import {sessionObject} from '../helpers/manageSessionStorage';
// import $ from "jquery";

@connect((store) => {
  return {login_response: store.login.login_response, errmsg:store.login.errmsg};
})

export class Login extends React.Component {
  constructor() {

    super();
    this.state = {
      uId: '',
      pwd: '',
      errmsg:""
      // token:"",
    };
  }
  onChangeUId(e) {
    const userId = e.target.value;
    this.setState({uId: userId});
  }
  onChangePwd(e) {
    const password = e.target.value;
    this.setState({pwd: password});
  }
  componentDidMount(){
    hidechatbot()
  }

  doAuthSSO(){
    debugger;
    console.log("login is called!!");
   //this.props.dispatch(authenticateFunc($("#username").val(),$("#password").val()))
   console.log("checking login form fields");
   // console.log(this.state.uId);
  //  if(this.state.uId==""||this.state.uId==null||this.state.uId.trim().length==0){
  //  this.state.errmsg = "Please enter the username!"
  //  $("#errormsg").text(this.state.errmsg);
//  }else if(this.state.pwd==""||this.state.pwd==null){
  //  this.state.errmsg = "Please enter the password!"
  //  $("#errormsg").text(this.state.errmsg);
//  if(this.state.token){
   this.props.dispatch(authenticateFuncSso())
  //  $("#errormsg").text(this.state.errmsg);
}

  doAuth() {
    //this.props.dispatch(authenticateFunc($("#username").val(),$("#password").val()))
    console.log("checking login form fields");
    // console.log(this.state.uId);
    if(this.state.uId==""||this.state.uId==null||this.state.uId.trim().length==0){
    this.state.errmsg = "Please enter the username!"
    $("#errormsg").text(this.state.errmsg);
  }else if(this.state.pwd==""||this.state.pwd==null){
    this.state.errmsg = "Please enter the password!"
    $("#errormsg").text(this.state.errmsg);
  }else{
    this.props.dispatch(authenticateFunc(this.state.uId, this.state.pwd))
    $("#errormsg").text(this.state.errmsg);
  }
  }
  render() {
    console.log("login is called!!")
    console.log(this.props)
    this.state.errmsg = this.props.errmsg;
    if (document.cookie.indexOf("JWT ") > 0 ) {
      console.log("authorized!!!");
      document.body.className = "";

      return (<Redirect to={"/"} />);
    } else {
    	document.body.className = "ma-splash-screen";
    	   localStorage.JWT = "Test Local Storage"
         removeChatbotOnLogout()
      return (

          <div className="ma-wrapper ma-login">
            <div className="ma-content">
              <div className="main-content">

				<div class="ma-content-left">
				</div>

			  <div class="ma-content-right">
             <form action="javascript:void(0);">
                <div className="login-container">
                  <div className="panel panel-default">
                    <div className="panel-heading"><img src={STATIC_URL + "assets/images/m_adv_logo.png" } alt="mAdvisor" className="img-responsive logo-img"/></div>
                    <div className="panel-body no-border">

                     {/* <h3>SIGN IN</h3> */}
                      <div className="login-form">
                        <div className="form-group">
                          <div className="input-group">
                            <input id="username" type="text" value={this.state.uId} onChange={this.onChangeUId.bind(this)} placeholder="Username" autocomplete="off" className="form-control"/>
                            {/*  <span className="input-group-addon">
                              <i className="fa fa-user"></i>
                            </span>*/}
                          </div>
                        </div>
                        <div className="form-group">
                          <div className="input-group">
                            <input id="password" type="password" value={this.state.pwd} onChange={this.onChangePwd.bind(this)} placeholder="Password" className="form-control"/>
                            {/*  <span className="input-group-addon">
                              <i className="fa fa-key"></i>
                            </span>*/}
                          </div>
                        </div>
                        <div className="form-group footer row">
                          {/*<div className="col-xs-6 remember text-left">
                            <div className="ma-checkbox">
                              <input type="checkbox" id="remember" className="needsclick"/>
                              <label htmlFor="remember"></label>
                            </div>
                            <label htmlFor="remember">Remember Me</label>

                          </div>*/}
                          <div className="col-xs-6 text-right">
                            
                          </div>

                        </div>
						<a href="#" className="xs-mt-20 pull-left">Forgot Password?</a>
                        <div className="form-group login-submit pull-right">
                        <button onClick={this.doAuthSSO.bind(this)} className="btn btn-primary xs-pl-20 xs-pr-20 xs-pt-5 xs-pb-5"><a href="https://ping.kenan.ai:9031/idp/startSSO.ping?PartnerSpId=advisor.kenan.ai" target="_blank" >SSO SIGN IN</a></button>
                          
                          <button onClick={this.doAuth.bind(this)} className="btn btn-primary xs-pl-20 xs-pr-20 xs-pt-5 xs-pb-5">SIGN IN</button>
                        </div>
						<div className="clearfix"></div>
                        <div className = "text-danger text-center" id="errormsg">{this.state.errmsg}</div>

                      </div>
                    </div>
                  </div>
                </div>
              </form>
		 </div>
              </div>
            </div>
          </div>


      );

    }
  }

}
