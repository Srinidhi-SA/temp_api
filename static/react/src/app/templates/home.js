 import React from "react";
 import LeftPanel from "./LeftPanel";
 import TopPanel from "./TopPanel";
 import DescriptionPanel from "./DescriptionPanel";
export default class Home extends React.Component {

	render(){
    console.log("home is called!!");
		return(
      <div className="main_wrapper">
      <LeftPanel/>
      <TopPanel/>
      <DescriptionPanel/>
      </div>

		 );
	}
}
