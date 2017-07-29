import React from "react";
import LeftPanel from "./LeftPanel";
import TopPanel from "./TopPanel";
import DescriptionPanel from "./DescriptionPanel";
import {Login} from "./login";
import { connect } from "react-redux";
import store from "../store";



@connect((store) => {
  return {user: store.user.user, userFetched: store.user.fetched, tweets: store.tweets.tweets, login_response: store.login.login_response};
})

export class Home extends React.Component {
  constructor(){
    super();
  }
  render() {

    console.log("home is called!!");
    console.log(store.getState().login.login_response);
    if (store.getState().login.login_response.status == 200 && store.getState().login.login_response.token != "") {
      console.log("authorized!!!");
      return (
        <div className="main_wrapper">
          <LeftPanel/>
          <TopPanel/>
          <DescriptionPanel desc_id="signals"/>
        </div>
      );
    } else {
      alert("please login to continue!!");
      return (<Login/>);
    }

  }
}
