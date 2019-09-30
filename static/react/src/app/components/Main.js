import React from "react";
import LeftPanel from "./common/LeftPanel";
import TopPanel from "./common/TopPanel";
import {Login} from "./Login";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../store";
import {isEmpty,setUserDetails,getUserDetailsOrRestart,enableChatbot,checkChatbotPresent,hidechatbot} from "../helpers/helper";
import {cookieObj} from '../helpers/cookiesHandler';
import Notifications, {notify} from 'react-notify-toast';
import {STATIC_URL} from "../helpers/env.js";
import {LexClass} from "./apps/lex";

@connect((store) => {
  return {
       login_response: store.login.login_response};
})

export class Main extends React.Component {
  constructor(props){
    super(props);
	console.log("props in main:::");
	console.log(props);
  }
  
  addChatbotScript() {
    //for chatbot
      if(!checkChatbotPresent()){
        if(window.location.pathname.indexOf("datamgmt")==-1){
       const script = document.createElement("script");

       script.src = "https://prodx.in/m-advisor-measure/client-plugin/bot.js";
       script.async = true;

       document.body.appendChild(script);
       //enableChatbot();
}
   }
 }
  render() {

    console.log("Main is called!!");
    console.log(this.props);
    // console.log(this.props.login_response);
    if (document.cookie.indexOf("JWT ") > 0 ) {
      // this.addChatbotScript()
      return (
        <div className="main_wrapper">
          <LeftPanel/>
          <TopPanel/>
          <Notifications options={{zIndex: 200, top: '70px'}} />
            {this.props.children}


  {/* <div class="container">
	<div class="row">
	 <div id="Smallchat">
    <div class="Layout Layout-open Layout-expand Layout-right" >
      <div class="Messenger_messenger">
        <div class="Messenger_header">
          <h4 class="Messenger_prompt">How can we help you?</h4> <span class="chat_close_icon"> <span class="glyphicon glyphicon-remove"></span></span> </div>
        <div class="Messenger_content">
          <div class="Messages">
            <div class="Messages_list">
            <div>djieh</div>
            </div>
          </div>
          <div class="Input Input-blank">
            <textarea class="Input_field" placeholder="Send a message..."></textarea>
           
              </div>
          </div>
        </div>
      </div>
    </div>
    <div class="chat_on"> <span class="chat_on_icon"><i class="fa fa-comments" aria-hidden="true"></i></span> </div>
    
  </div>
        
       </div>  */}
        </div>
      );
    } else {
        sessionStorage.clear();
        cookieObj.clearCookies();
      console.log("Session ended!!");
      //bootbox.alert("Session Timeout. Please login again to continue.")
      return(<Redirect to={"/login"} />);
    }

  }
}
