import React from "react";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
import {Redirect} from 'react-router';
import store from "../../store";
import {C3Chart} from "../c3Chart";
import ReactDOM from 'react-dom';
import {STATIC_URL} from "../../helpers/env.js";
import { Scrollbars } from 'react-custom-scrollbars';
import {getScoreSummaryInCSV,emptyScoreCSVData} from "../../actions/appActions";
import {Link} from "react-router-dom";
import {Button} from "react-bootstrap";
import {isEmpty} from "../../helpers/helper";

@connect((store) => {
	return {login_response: store.login.login_response, scoreCSVData: store.apps.scoreSummaryCSVData,
	    currentAppId:store.apps.currentAppId,scoreSlug:store.apps.scoreSlug};
})

export class DataPreviewLeftPanel extends React.Component {
	constructor(props) {
		super(props);
	}
	 componentWillMount(){
	     if(!isEmpty(this.props.scoreCSVData)){
	         this.props.dispatch(getScoreSummaryInCSV(this.props.match.params.slug))   
	     }
	  }
	 emptyScoreCSVData(){
	     this.props.dispatch(emptyScoreCSVData())
	 }
	render() {
		console.log("score data preview is called##########3");
		 var pattern = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
		 var scoreLink = "/apps/" + store.getState().apps.currentAppId + "/scores/" + this.props.match.params.slug;
		const scoreData = this.props.scoreCSVData;
		var tableThTemplate = "";
		var tableRowTemplate = "";
		if(!isEmpty(scoreData)){
		    tableThTemplate = scoreData.map(function(row,id){
		        let colData = "";
		        if(id == 0){
		           colData =  row.match(pattern).map((colData,index) =>{
		               let colIndex = "row_"+id+index
		                return(<th key={colIndex}>{colData}</th>)
		            })
		        }
		        return colData;
		    });
		    tableRowTemplate = scoreData.map(function(row,id){
                let colData = "";
                let colIndex = "row_"+id
                if(id > 0){
                   colData =  row.match(pattern).map((colData,index) =>{
                        return(<td>{colData}</td>)
                    })
                }
                return <tr key = {colIndex}>{colData}</tr>;
            });
		    return(
		            <div className="side-body">
                    {/* <!-- Page Title and Breadcrumbs -->*/}
                    <div className="page-head">
                    <div className="row">
                    <div className="col-md-8">
                    <h4>Score Data Preview</h4>
                    </div>
                    </div>
                    <div className="clearfix"></div>
                    </div>
                    { /*<!-- /.Page Title and Breadcrumbs -->*/ }
                    { /*<!-- Page Content Area -->*/}
                    <div className="main-content">
                    <div className="row">
                    <div className="col-md-12">
                    <div className="panel panel-borders">

                    <div className="clearfix"></div>
                    <div className="table-responsive scoreDataPreview">
                    
                    <Scrollbars>
                    <table className="table table-condensed table-hover table-bordered table-striped cst_table">
                    <thead>
                    <tr>
                    {tableThTemplate}
                    </tr>
                    </thead>
                    <tbody className="no-border-x">
                   {tableRowTemplate}
                    </tbody>

                    </table>
                    </Scrollbars>
                    
                    </div>
                    </div>
                    </div>
                    </div>
                    
                    <div className="row col-md-offset-11">
                    <div className="panel">
                    <div className="panel-body">
                    <Link to={scoreLink} onClick={this.emptyScoreCSVData.bind(this)}><Button> Close</Button></Link>
                    </div>
                    </div>
                    </div>
                    
                    </div>
                    </div>
                    
            );
		}else{
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
