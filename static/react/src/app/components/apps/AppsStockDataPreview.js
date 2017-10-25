import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab,Button} from "react-bootstrap";
import {DataPreview} from "../data/DataPreview";
import {StockUploadDomainModel} from "../apps/StockUploadDomainModel";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {connect} from "react-redux";
import {APPID1,APPID2,APPID3,APPNAME1,APPNAME2,APPNAME3} from "../../helpers/helper.js"
import {hideDataPreviewRightPanels,updateUploadStockPopup,getConceptsList} from "../../actions/appActions";
import {STATIC_URL} from "../../helpers/env.js"
import {isEmpty} from "../../helpers/helper";
import {getStockDataSetPreview} from "../../actions/dataActions";

@connect((store) => {
	return {login_response: store.login.login_response,
		currentAppId:store.apps.currentAppId,
		dataPreview: store.datasets.dataPreview,
		stockUploadDomainModal:store.apps.stockUploadDomainModal,
		stockSlug:store.apps.stockSlug,
		};
})


export class AppsStockDataPreview extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }
  componentWillMount(){
	  if (this.props.dataPreview == null || isEmpty(this.props.dataPreview)||this.props.dataPreview.status == 'FAILED') {
		  this.props.dispatch(getStockDataSetPreview(this.props.match.params.slug));
	  }
  }
  componentDidMount(){
      hideDataPreviewRightPanels();
			this.props.dispatch(getConceptsList());
  }
  componentWillUpdate(){
	  hideDataPreviewRightPanels();
  }
  componentDidUpdate(){
	  hideDataPreviewRightPanels();
  }
  updateUploadStockPopup(flag){
  	this.props.dispatch(updateUploadStockPopup(flag))
  }
  render() {
	  if(store.getState().apps.stockAnalysisFlag){
			let _linkAnalysis = "/apps-stock-advisor/"+store.getState().apps.stockSlug;
	    	return (<Redirect to={_linkAnalysis}/>);
	 }
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
				<Link to="/apps"><Button>Close</Button></Link>
				</div>
				<div className="col-md-1 text-right">
				<Button bsStyle="primary" onClick={this.updateUploadStockPopup.bind(this,true)}> Proceed</Button>
				</div>
				</div>
				</div>
				</div>
				</div>
				<StockUploadDomainModel/>


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
