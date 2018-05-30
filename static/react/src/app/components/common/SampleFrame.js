import React from "react";
import Iframe from 'react-iframe'
import {getUserDetailsOrRestart} from "../../helpers/helper";
import {KYLO_UI} from "../../helpers/env";


export class SampleFrame extends React.Component {
  constructor(){
    super();
  }

  render() {
    console.log("in sample frame========")
    console.log("cokies rem"+document.cookie.indexOf("remember"))
    var encodedUri= encodeURIComponent("/index.html#!/"+this.props.match.params.kylo_url)
    console.log("url encoded====>"+encodedUri)
    // if(document.cookie.indexOf("remember")>-1)
    var kylo_url= KYLO_UI+"/kylo/integration.html?username="+getUserDetailsOrRestart.get().userName+"&password="+getUserDetailsOrRestart.get().dm_token+"&redirect="+encodedUri
    // else
    // var kylo_url="http://localhost:3000/index.html#!/"+this.props.match.params.kylo_url
    console.log("url====>"+kylo_url)
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
