import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab,Button} from "react-bootstrap";
import {DataPreview} from "../data/DataPreview";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {connect} from "react-redux";
import {APPID1,APPID2,APPID3,APPNAME1,APPNAME2,APPNAME3} from "../../helpers/helper.js"
import {hideDataPreviewRightPanels} from "../../actions/appActions";
import {STATIC_URL} from "../../helpers/env.js"
import {isEmpty} from "../../helpers/helper";
import {getDataSetPreview} from "../../actions/dataActions";

@connect((store) => {
	return {login_response: store.login.login_response,
		currentAppId:store.apps.currentAppId,
		dataPreview: store.datasets.dataPreview,
		};
})


export class AppsStockDataPreview extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }
  componentWillMount(){
	  if (this.props.dataPreview == null || isEmpty(this.props.dataPreview)||this.props.dataPreview.status == 'FAILED') {
		  this.props.dispatch(getDataSetPreview(this.props.match.params.slug));
	  }
  }
  componentDidMount(){
      hideDataPreviewRightPanels();
  }
  componentWillUpdate(){
	  hideDataPreviewRightPanels();
  }
  componentDidUpdate(){
	  hideDataPreviewRightPanels();
  }
  render() {
	  let dataPreview = store.getState().datasets.dataPreview;
		if(dataPreview){
			return (   
					<div >
	            <DataPreview history={this.props.history} match={this.props.match}/>" +
	            <div className="main-content">
	            <div className="row buttonRow" >
				<div className="col-md-12">

				<div className="row">
				
				<div className="col-md-1 col-md-offset-10 text-right">
				<Button> <Link to="/apps-stock-advisor">Close</Link></Button>
				</div>
				<div className="col-md-1 text-right">
				<Button> Proceed</Button>
				</div>
				</div>
				</div>
				</div>
				</div>
				
				
				
	        </div>
	        );
		}else{
			return (
					   <div>
			            <img id="loading" src={ STATIC_URL + "assets/images/Preloader_2.gif"} />
			          </div>
			);
		}
  }
}
