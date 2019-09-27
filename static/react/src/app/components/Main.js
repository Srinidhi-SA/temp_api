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
  componentDidMount() {

    $(".chat_on").click(function(){
      $(".Layout").toggle();
      $(".chat_on").hide(300);
  });
  
     $(".chat_close_icon").click(function(){
      $(".Layout").hide();
         $(".chat_on").show(300);
  });
    var waveform = window.Waveform();
    var message = document.getElementById('message');
    var config, conversation;
    message.textContent = 'Passive';

    document.getElementById('audio-control').onclick = function () {

        AWS.config.credentials = new AWS.Credentials(document.getElementById('ACCESS_ID').value, document.getElementById('SECRET_KEY').value, null);
        AWS.config.region = 'us-east-1';
        
        config = {
            lexConfig: { botName: document.getElementById('BOT').value }
        };

        conversation = new LexAudio.conversation(config, function (state) {
            message.textContent = state + '...';
            if (state === 'Listening') {
                waveform.prepCanvas();
            }
            if (state === 'Sending') {
                waveform.clearCanvas();
            }
        }, function (data) {
            console.log('Transcript: ', data.inputTranscript, ", Response: ", data.message);
        }, function (error) {
            message.textContent = error;
        }, function (timeDomain, bufferLength) {
            waveform.visualizeAudioBuffer(timeDomain, bufferLength);
        });
        conversation.advanceConversation();
    };

  
  
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
            <img data-toggle="modal" data-target="#myModal" className="lexIcon" src= { STATIC_URL + "assets/images/LexIcon.png"} />
    
    <div class="modal" id="myModal" role="dialog">
    <div class="modal-dialog">
    
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal">&times;</button>
          <h4 class="modal-title">Create Model</h4>
        </div>
        <div class="modal-body" style={{height:400}}>
          <div style={{fontWeight:600, marginTop: 8}}>Please Click on the below icon to trigger model creation :</div>
            <div className="audio-control">
                <p id="audio-control" className="white-circle">
                    <img style={{height:55,marginTop:6}} src= { STATIC_URL + "assets/images/LexIcon.png"} />
                    <canvas className="visualizer"></canvas>
                </p>
                <p><span id="message"></span></p>
                <div className="noDisplay">
                <p>
                    <input type="password" id="ACCESS_ID" name="ACCESS ID" placeholder="ACCESS ID" value="AKIAVIZ5TXPQHRHOCK44"/>
                </p>
                <p>
                    <input type="password" id="SECRET_KEY" name="SECRET KEY" placeholder="SECRET KEY" value="K2AgBNvRCpW6EYF4QsR2vP4EDDGHpbt6fiVCVpvh"/>
                </p>
                <input type="text" id="BOT" name="BOT" placeholder="BOT" value="mBot" />
                </div>
            </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        </div>
      </div>
      
    </div>
  </div>

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
