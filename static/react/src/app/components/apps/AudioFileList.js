import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {connect} from "react-redux";
import {APPID4,APPNAME4} from "../../helpers/helper.js";
import {AudioFileUpload} from "./AudioFileUpload";
import {AppsLoader} from "../common/AppsLoader";

@connect((store) => {
	return {login_response: store.login.login_response,
        currentAppId:store.apps.currentAppId,
      
		};
})


export class AudioFileList extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }
  componentWillMount(){
    
  }
 
  render() {
    console.log("audio file list is called##########3");

    return (
          <div className="side-body">
            <div className="main-content">
            <AudioFileUpload/>
            <AppsLoader/>
          </div>
        </div>
      );
  }
}
