import React from "react";
import Iframe from 'react-iframe'
import {getUserDetailsOrRestart,hidechatbot,removeChatbotOnLogout} from "../../helpers/helper";
import {KYLO_UI,API} from "../../helpers/env";


export class SampleFrame extends React.Component {
  constructor(){
    super();
  }

  componentWillMount(){
   hidechatbot()
  removeChatbotOnLogout()
  }

  render() {
    console.log("in sample frame========")
    console.log("cokies rem"+document.cookie.indexOf("remember"))
    var encodedUri= encodeURIComponent("/index.html#!/"+this.props.match.params.kylo_url)
    console.log("url encoded====>"+encodedUri)
    //var kylo_url=API
     //if(document.cookie.indexOf("remember")>-1)
     var kylo_url= KYLO_UI+"/assets/integration.html?username="+getUserDetailsOrRestart.get().userName+"&password="+getUserDetailsOrRestart.get().dm_token+"&redirect="+encodedUri
    // for luke:  var kylo_url= KYLO_UI+"/assets/integration.html?username=dladmin&password=passworddladmin0@123&redirect="+encodedUri
    //for dev
    //var kylo_url= KYLO_UI+"/assets/integration.html?username=dladmin&password=thinkbig&redirect="+encodedUri

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
