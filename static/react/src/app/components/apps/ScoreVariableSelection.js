import React from "react";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {Modal,Button,Tab,Row,Col,Nav,NavItem,Form,FormGroup,FormControl} from "react-bootstrap";

import {C3Chart} from "../c3Chart";
import ReactDOM from 'react-dom';
import {DataVariableSelection} from "../data/DataVariableSelection";
import {updateTrainAndTest,createScore} from "../../actions/appActions";
import {AppsLoader} from "../common/AppsLoader";


@connect((store) => {
	return {login_response: store.login.login_response, dataPreview: store.datasets.dataPreview,
	};
})

export class ScoreVariableSelection extends React.Component {
	constructor(props) {
		super(props);

	}
	createScore(event){
		 event.preventDefault();
		this.props.dispatch(createScore($("#createScoreName").val(),$("#createScoreAnalysisList").val()))
	}
	render() {
		console.log("Create Score Variable Selection  is called##########3");
		 if(store.getState().apps.scoreSummaryFlag){
				let _link = "/apps/"+store.getState().apps.currentAppId+'/scores/'+store.getState().apps.scoreSlug;
				return(<Redirect to={_link}/>);
			}
		 
		let dataPrev = store.getState().datasets.dataPreview;
		 const metaData = dataPrev.meta_data.columnData;
		 let renderSelectBox = null;
		if(metaData){
			renderSelectBox =  <select className="form-control" id="createScoreAnalysisList">
			{metaData.map((metaItem,metaIndex) =>
			<option key={metaIndex} value={metaItem.name}>{metaItem.name}</option>
			)}
			</select>
		}else{
			renderSelectBox = <option>No Variables</option>
		}
			return(
					 <div className="side-body">
			            <div className="page-head">
			               <div className="row">
			                  <div className="col-md-8">
			                     <h2>Variable Selection</h2>
			                  </div>
			               </div>
			               <div className="clearfix"></div>
			            </div>
			            <div className="main-content">
				        <div className="panel panel-default">
				      <div className="panel-body">    
				      <Form onSubmit={this.createScore.bind(this)}>
				      <FormGroup role="form">
				      <div className="row">			          
			          <div className="col-lg-12">
			              <div className="form-group">
			              <div className="col-lg-2"><label>I want to analyse</label></div>
			              <div className="col-lg-4"> {renderSelectBox}</div>
			              </div>
			          </div>{/*<!-- /.col-lg-4 -->*/}
			          </div>
			          
				      <DataVariableSelection/>
				      <div className="row">
				      <div className="col-lg-4 col-lg-offset-8">
		              <div className="form-group">
		                <input type="text" name="createScoreName" required={true} id="createScoreName" className="form-control input-sm" placeholder="Create Score Name" />
		              </div>
		          </div>
		          </div>
		          
				      <div className="row">
				      <div className="col-lg-2 col-lg-offset-10">
				      <Button type="submit" bsStyle="primary">SCORE MODEL</Button>
				      </div>
				      </div>
				      </FormGroup>
				      </Form>
				      </div>
				      </div>
				      </div>
				      <AppsLoader/>
						</div>
			);
	}
}
