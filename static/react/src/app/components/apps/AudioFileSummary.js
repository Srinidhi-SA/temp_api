import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {Button} from "react-bootstrap";
import {} from "../../actions/appActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {STATIC_URL} from "../../helpers/env.js"
import {isEmpty,USERDETAILS} from "../../helpers/helper";
import {getAudioFile,getListOfCards,updateAudioFileSummaryFlag} from "../../actions/appActions";
import {Card} from "../signals/Card";
import {Link} from "react-router-dom";
import Breadcrumb from 'react-breadcrumb';

@connect((store) => {
	return {login_response: store.login.login_response,
		audioFileSummary:store.apps.audioFileSummary,
	};
})

export class AudioFileSummary extends React.Component {
	constructor(){
		super();
	}
	componentWillMount() {
		//It will trigger when refresh happens on url
		if(isEmpty(this.props.audioFileSummary)){
			this.props.dispatch(getAudioFile(this.props.match.params.audioSlug));   
		}
	}

	componentDidMount() {
		if(!$.isEmptyObject(store.getState().apps.audioFileSummary)){
			if(store.getState().apps.audioFileSummary.slug != store.getState().apps.audioFileSlug)
				this.props.dispatch(getAudioFile(store.getState().apps.audioFileSlug));
		}else{
			this.props.dispatch(getAudioFile(store.getState().apps.audioFileSlug));
		}
	}
	updateAudioFlag(){
		this.props.dispatch(updateAudioFileSummaryFlag(false))
	}
	render() {
		console.log("apps Audio Detail View is called##########3");
		const audioSummary = store.getState().apps.audioFileSummary;

		if (!$.isEmptyObject(audioSummary)) {
			console.log(this.props)
			let listOfCardList = getListOfCards(audioSummary.meta_data.listOfCards)
			let cardDataList = listOfCardList.map((data, i) => {
				if(i == 1)
					return (<div className="col-md-4"><Card key={i} cardData={data} /></div>)
			    if(i == 2)
					return (<div><div className="col-md-8"><Card key={i} cardData={data} /></div><div class="clearfix"></div></div>)
				else return (<Card key={i} cardData={data} />)

			});
			if(listOfCardList){
				return (
						<div className="side-body">

						<div className="page-head">
			              <div class="row">
			                <div class="col-md-12">
			                  <Breadcrumb path={[
			                    {
			                      path: '/apps',
			                      label: 'Apps'
			                    }, {
				                      path: '/apps/audio',
				                      label: 'Audio'
				                    },{
			                      path: '/apps/audio/' + this.props.match.params.audioSlug,
			                      label: audioSummary.name
			                    }
			                  ]}/>
			                </div>
			              </div>
			              <div class="clearfix"></div>
			            </div>
			            
						<div className="main-content">
						<div className="row">
						<div className="col-md-12">

						<div className="panel panel-mAd documentModeSpacing ">
						<div className="panel-heading">
						<h2 className="pull-left">{store.getState().apps.audioFileSummary.name}</h2>

						<div className="btn-toolbar pull-right">
						<div className="btn-group btn-space">

						<button type="button" className="btn btn-default" disabled = "true" title="Document Mode">
						<i className="pe-7s-news-paper pe-lg"></i>
						</button>
						<Link className="tabs-control right grp_legends_green continue" onClick={this.updateAudioFlag.bind(this)} to="/apps/audio">
						<button type="button" className="btn btn-default">
						<i className="pe-7s-close pe-lg"></i>
						</button>
						</Link>
						</div>
						</div>

						<div className="clearfix"></div>
						</div>
						<div className="panel-body">
						<div className="row-fluid"> 

						{cardDataList}

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

