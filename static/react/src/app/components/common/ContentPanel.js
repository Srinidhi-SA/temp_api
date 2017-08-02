import React from "react";
import {MainContent} from "./MainContent";
import {MainHeader} from "./MainHeader";


export default class ContentPanel extends React.Component {

  render() {
    // console.log("in description!!");
    // console.log(this.props);

        return (

        <div className="side-body">
            <MainContent/>
            <MainHeader />
        </div>
      );
  }
}
