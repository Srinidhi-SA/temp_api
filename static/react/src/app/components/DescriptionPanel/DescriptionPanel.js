import React from "react";
import {Signals} from "./signals";
import {Desc_Body} from "./desc_body";
import {Desc_Header} from "./desc_header";


export default class DescriptionPanel extends React.Component {

  render() {
    console.log("decpid")
		console.log(this.props.desc_id)
		var component_name={};

		//check for which id to show in Content
		switch(this.props.desc_id){
			case "signals":
			component_name="Signals";
      break;

		}
    console.log("compinentname is "+component_name)

if(component_name){
    return (
      <div>
        <div className="side-body">
            <Desc_Header/>
            <Desc_Body/>
        </div>
      </div>
      );
  }else{
    return (
      <div>
        <div className="side-body">

          {/*/ Page Title and Breadcrumbs -->*/}
          <div className="page-head">
            <ol className="breadcrumb">
              <li>
                <a href="#">Story</a>
              </li>
              <li className="active">Sales Performance Report</li>
            </ol>
            <h2>Sales Performance Report</h2>
          </div>
          {/*/ /.Page Title and Breadcrumbs -->

																	// Page Content Area -->*/}
          <div className="main-content">

            {/*Content Area*/}
						no compo
            Content Area
          </div>
          {/* // /.Page Content Area -->*/}

        </div>
      </div>

    );

  }
  }
}
