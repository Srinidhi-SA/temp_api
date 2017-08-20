import React from "react";
import {connect} from "react-redux";
import store from "../../store";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {AppsCreateScore} from "./AppsCreateScore";
import {Card} from "../signals/Card";
import {getListOfCards} from "../../actions/appActions";
import CircularProgressbar from 'react-circular-progressbar';
import {STATIC_URL} from "../../helpers/env.js"

@connect((store) => {
	return {login_response: store.login.login_response, 
		modelList:store.apps.modelList,modelSummary:store.apps.modelSummary,
		};
})


export class AppsModelDetail extends React.Component {
  constructor() {
    super();
  }
  
  render() {
    console.log("apps Model Detail View is called##########3");
    const modelSummary = store.getState().apps.modelSummary.data;
	if (modelSummary) {
		console.log(this.props)
		let listOfCardList = getListOfCards(modelSummary.model_summary.listOfCards)
		let cardDataList = listOfCardList.map((data, i) => {
			if( i != 0){
				if(i%2 != 0)
				return (<div className="col-md-6 xs-p-50 clearfix"><Card cardData={data} /></div>)
				else
				return (<div className="col-md-6 xs-p-50"><Card cardData={data} /></div>)
			}
             else return (<Card key={i} cardData={data} />)
			
		                    });
		if(listOfCardList){
			return (
			          <div className="side-body">
			          
			          <div className="main-content">
			          <div className="row">
		                <div className="col-md-12">
		                 
		                <div className="panel panel-mAd">
		                    <div className="panel-heading">
		                      <h2>{store.getState().apps.modelSummary.name}</h2>
		                      <div className="clearfix"></div>
		                    </div>
		                   <div className="panel-body">
		                   <div className="row-fluid"> 
		           
		                  {cardDataList}

		                    </div>
		                    <div class="row">
		                    <div className="col-md-2 col-md-offset-10">
		                   <AppsCreateScore match={this.props.match}/>
		                   </div>
		                   </div>
		             </div>
		                    </div>
		                  </div>
		                </div>
		              </div>
		  
		             
			           
			          </div>
			      );	
		}
	}
	
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
