import React from "react";
import Iframe from 'react-iframe'

export class SampleFrame extends React.Component {
  constructor(){
    super();
  }

  render() {
    console.log("in sample frame========")
    var kylo_url="http://localhost:3000/index.html#!/"+this.props.match.params.kylo_url
   return (
     <Iframe url={kylo_url}
             width="1150px"
             height="600px"
             id="myId"
             className="myClassname"
             display="initial"
             position="relative"
             styles={{left:"100px",top:"80px"}}
             allowFullScreen/>
       );
  }
}
