import React from "react";
import Iframe from 'react-iframe'

export class SampleFrame extends React.Component {
  constructor(){
    super();
  }

  render() {
   return (
     <Iframe url="http://localhost:8400"
             width="1150px"
             height="600px"
             id="myId"
             className="myClassname"
             display="initial"
             position="relative"
             styles={{border: "3px solid #73AD21",left:"100px",top:"80px"}}
             allowFullScreen/>
       );
  }
}
