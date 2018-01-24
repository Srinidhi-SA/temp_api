import React from "react";
import {connect} from "react-redux";
import store from "../../store";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab,Button} from "react-bootstrap";
import {AppsCreateScore} from "./AppsCreateScore";
import {Card} from "../signals/Card";
import {getListOfCards,getAppsModelSummary,updateModelSlug,handleExportAsPMMLModal} from "../../actions/appActions";
import {storeSignalMeta} from "../../actions/dataActions";
import CircularProgressbar from 'react-circular-progressbar';
import {STATIC_URL} from "../../helpers/env.js"
import {isEmpty} from "../../helpers/helper";
import {Link} from "react-router-dom";
import {ExportAsPMML} from "./ExportAsPMML";

@connect((store) => {
	return {login_response: store.login.login_response, 
		modelList:store.apps.modelList,modelSummary:store.apps.modelSummary,
		modelSlug:store.apps.modelSlug,
		currentAppId:store.apps.currentAppId
		};
})


export class AppsModelDetail extends React.Component {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
		this.props.dispatch(storeSignalMeta(null,this.props.match.url));
		//It will trigger when refresh happens on url
		if(isEmpty(this.props.modelSummary)){
		    this.props.dispatch(getAppsModelSummary(this.props.match.params.slug));  
		    this.props.dispatch(updateModelSlug(this.props.match.params.slug));
		}
		 
	}
  
  print() {
    window.print();
  }
  componentDidMount() {
	  if(!isEmpty(store.getState().apps.modelSummary)){
		  if(store.getState().apps.modelSummary.slug != store.getState().apps.modelSlug)
		  this.props.dispatch(getAppsModelSummary(store.getState().apps.modelSlug));
	  }else{
		  this.props.dispatch(getAppsModelSummary(store.getState().apps.modelSlug));
	  }
  }
  componentDidUpdate(){
      $(".chart-data-icon").next("div").next("div").removeClass("col-md-7 col-md-offset-2").addClass("col-md-10")
  }
  handleExportAsPMMLModal(flag){
      this.props.dispatch(handleExportAsPMMLModal(flag))
  }
  render() {
    console.log("apps Model Detail View is called##########3");
    const modelSummary = store.getState().apps.modelSummary;
    const modelLink = "/apps/"+store.getState().apps.currentAppId+"/models";
	if (!$.isEmptyObject(modelSummary)) {
		console.log(this.props)
		let listOfCardList = getListOfCards(modelSummary.data.model_summary.listOfCards)
		let cardDataList = listOfCardList.map((data, i) => {
			if( i != 0){
				if(i%2 != 0)
				return (<div className="col-md-6 xs-p-30 clearfix"><Card cardData={data} /></div>)
				else
				return (<div className="col-md-6 xs-p-30"><Card cardData={data} /></div>)
			}
             else return (<Card key={i} cardData={data} />)
			
		                    });
		if(listOfCardList){
			return (
			          <div className="side-body">
			          
			          <div className="main-content">
			          <div className="row">
		                <div className="col-md-12">
		                 
		                <div className="panel panel-mAd documentModeSpacing box-shadow">
		                    <div className="panel-heading">
		                      <h3 className="xs-mt-0">{store.getState().apps.modelSummary.name}
		                      
		                      <div className="btn-toolbar pull-right">
		                        <div className="btn-group">
		                        <button type="button" className="btn btn-default" onClick={this.print.bind(this)} title="Print Document"><i className="fa fa-print"></i></button>
		                          <button type="button" className="btn btn-default" disabled = "true" title="Document Mode">
		                             <i class="zmdi zmdi-hc-lg zmdi-view-web"></i>
		                            </button>
							   <Link className="btn btn-default continue btn-close" to={modelLink}>
		                         
		                            <i class="zmdi zmdi-hc-lg zmdi-close"></i>
		                          
								 </Link>
		                        </div>
		                      </div>
		                     </h3> 
		                      <div className="clearfix"></div>
		                    </div>
		                   <div className="panel-body no-border">
		                   <div className="row-fluid"> 
		           
		                  {cardDataList}

		                    </div>
		                    <div class="row">
		                    <div className="col-md-12 text-right ">
		                    <Button bsStyle="primary" onClick={this.handleExportAsPMMLModal.bind(this,true)}>Export As PMML</Button>
		                   <AppsCreateScore match={this.props.match}/>
		                   </div>
		                   </div>
		             </div>
		             <ExportAsPMML/>
		                    </div>
		                  </div>
		                </div>
		              </div>
		  
		             
			           
			          </div>
			      );	
		}
	}
	
	else{
		return (
	
		      <div className="side-body">
		        <div className="page-head">
		        </div>
		        <div className="main-content">
		          <img id="loading" src={ STATIC_URL + "assets/images/Preloader_2.gif" } />
		        </div>
		      </div>
		    );
	}
    
  }
}
