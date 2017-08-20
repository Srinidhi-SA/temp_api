import React from "react";
import {connect} from "react-redux";
import store from "../../store";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {AppsCreateScore} from "./AppsCreateScore";
import {Card} from "../signals/Card";
import {getListOfCards} from "../../actions/appActions";
import {Button} from "react-bootstrap";

@connect((store) => {
	return {login_response: store.login.login_response, 
		scoreList:store.apps.scoreList,scoreSummary:store.apps.scoreSummary,
		};
})


export class AppsScoreDetail extends React.Component {
  constructor() {
    super();
  }
  
  render() {
    console.log("apps Score Detail View is called##########3");
    const scoreSummary = store.getState().apps.scoreSummary.data;
    console.log(scoreSummary)
	if (scoreSummary) {
		console.log(this.props)
		let listOfCardList = getListOfCards(scoreSummary.listOfCards)
		let cardDataList = listOfCardList.map((data, i) => {
		
            return (<Card key={i} cardData={data} />)
			
		                    });
		if(listOfCardList){
			return (
			          <div className="side-body">
			          
			          <div className="main-content">
			          <div className="row">
		                <div className="col-md-12">
		                 
		                <div className="panel panel-mAd">
		                    <div className="panel-heading">
		                      <h2>{store.getState().apps.scoreSummary.name}</h2>
		                      <div className="clearfix"></div>
		                    </div>
		                   <div className="panel-body">
		                   <div className="row-fluid"> 
		           
		                  {cardDataList}

		                    </div>
		                    <div class="row">
		                    <div className="col-md-2 col-md-offset-10">
		                    <Button className="btn btn-primary md-close">Download</Button>
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
		          <img id="loading" src="/assets/images/Preloader_2.gif"/>
		        </div>
		      </div>
		    );
    
  }
}
