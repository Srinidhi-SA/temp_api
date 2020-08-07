import React from "react";
import store from "../../store";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";

import {MainHeader} from "../common/MainHeader";
import {
    Tabs,
    Tab,
    Pagination,
    Tooltip,
    OverlayTrigger,
    Popover
} from "react-bootstrap";
import {AppsCreateScore} from "./AppsCreateScore";
import {
    getAppsScoreList,
    getAppsScoreSummary,
    updateScoreSlug,
    handleScoreRename,
    handleScoreDelete,
    activateModelScoreTabs,
    storeScoreSearchElement,
    storeAppsScoreSortElements,
    openAppsLoader,
    createScoreSuccessAnalysis
} from "../../actions/appActions";
import {DetailOverlay} from "../common/DetailOverlay";
import {STATIC_URL} from "../../helpers/env.js"
import {SEARCHCHARLIMIT,getUserDetailsOrRestart,SUCCESS,INPROGRESS, FAILED, statusMessages} from  "../../helpers/helper"
import Dialog from 'react-bootstrap-dialog'
import {openShareModalAction} from "../../actions/dataActions";

var dateFormat = require('dateformat');

@connect((store) => {
    return {login_response: store.login.login_response, scoreList: store.apps.scoreList, scoreSlug: store.apps.scoreSlug, currentAppId: store.apps.currentAppId, score_search_element: store.apps.score_search_element,apps_score_sorton:store.apps.apps_score_sorton, apps_score_sorttype:store.apps.apps_score_sorttype};
})

export class ScoreCard extends React.Component {
    constructor(props) {
        super(props);
    }
    
    handleScoreDelete(slug) {
        this.props.dispatch(handleScoreDelete(slug, this.dialog));
    }
    handleScoreRename(slug, name) {
        this.props.dispatch(handleScoreRename(slug, this.dialog, name));
    }
    getScoreSummary(slug,status,sharedSlug) {
        if(status==FAILED){
            bootbox.alert(statusMessages("error","Unable to create Score. Please check your connection and try again.","small_mascot"));            
        }else{
            this.props.dispatch(updateScoreSlug(slug,sharedSlug));
        }
    }
    openDataLoaderScreen(data){
            this.props.dispatch(openAppsLoader(data.completed_percentage,data.completed_message));
            this.props.dispatch(createScoreSuccessAnalysis(data));
    }
    openShareModal(shareItem,slug,itemType) {
        this.props.dispatch(openShareModalAction(shareItem,slug,itemType));
       }
    render() {
        var scoreList = this.props.data;
        const appsScoreList = scoreList.map((data, i) => {
            var modeSelected= store.getState().apps.analystModeSelectedFlag?'/analyst' :'/autoML'
           
            if(data.status==FAILED){
                var scoreLink = "/apps/" + this.props.match.params.AppId + modeSelected + "/scores/";
            }else{
            var scoreLink = "/apps/" + this.props.match.params.AppId + modeSelected + "/scores/" + data.slug;
            }
            var scoreLink1 = <Link id={data.slug} to={scoreLink} onClick={this.getScoreSummary.bind(this, data.slug,data.status,data.shared_slug)}>{data.name}</Link>;
            var percentageDetails = "";
                        if(data.status == INPROGRESS){
                            percentageDetails =   <div class=""><i className="fa fa-circle inProgressIcon"></i><span class="inProgressIconText">{data.completed_percentage >= 0 ? data.completed_percentage+' %':"In Progress"}</span></div>;
                            scoreLink1 = <a class="cursor" onClick={this.openDataLoaderScreen.bind(this,data)}> {data.name}</a>;
                        }else if(data.status == SUCCESS){
                            data.completed_percentage = 100;
                            percentageDetails =   <div class=""><i className="fa fa-check completedIcon"></i><span class="inProgressIconText">{data.completed_percentage}&nbsp;%</span></div>;
                        }else if(data.status == FAILED){
                            percentageDetails =  <div class=""><font color="#ff6600">Failed</font></div>
                        }
            var permissionDetails = data.permission_details;
            var isDropDown = permissionDetails.remove_score || permissionDetails.rename_score; 
            return (
                    <div className="col-md-3 xs-mb-15 list-boxes" key={i}>
                    <div className="rep_block newCardStyle" name={data.name}>
                    <div className="card-header"></div>
                    <div className="card-center-tile">
                    <div className="row">
                    
                    <div className="col-xs-12">
                    <h5 className="title newCardTitle pull-left">
                    {scoreLink1}
                    </h5>
					<div className="pull-right"><img src={STATIC_URL + "assets/images/apps_score_icon.png"} alt="LOADING"/></div>
					<div className="clearfix"></div>
					
                    
                    <div className="clearfix"></div>
                    {percentageDetails}
                  
                    </div>
                    </div>
                    </div>
                    <div className="card-footer">
                    <div className="left_div">
                    <span className="footerTitle"></span>{getUserDetailsOrRestart.get().userName}
                    <span className="footerTitle">{dateFormat(data.created_at, "mmm d,yyyy HH:MM")}</span>
                    </div>
					
					{
                        isDropDown == true ? <div class="btn-toolbar pull-right">
                    <a className="dropdown-toggle more_button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
                    <i className="ci zmdi zmdi-hc-lg zmdi-more-vert"></i>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-right drp_cst_width" aria-labelledby="dropdownMenuButton">
					<li className="xs-pl-20 xs-pr-20 xs-pt-10 xs-pb-10"><DetailOverlay details={data}/> </li>
					<li className="xs-pl-20 xs-pr-20 xs-pb-10">
					
						{permissionDetails.rename_score == true ?
                    <span onClick={this.handleScoreRename.bind(this, data.slug, data.name)}>
                    <a className="dropdown-item btn-primary" href="#renameCard" data-toggle="modal">
                    <i className="fa fa-pencil"></i>
                    &nbsp;&nbsp;Rename</a>
                    </span>:""}
                    {permissionDetails.remove_score == true ?
                    <span onClick={this.handleScoreDelete.bind(this, data.slug)}>
                    <a className="dropdown-item btn-primary" href="#deleteCard" data-toggle="modal">
                    <i className="fa fa-trash-o"></i>&nbsp;&nbsp;{data.status == "INPROGRESS"
                                ? "Stop"
                                : "Delete"}</a>
                    </span>:""}
                    {data.status == "SUCCESS"? <span  className="shareButtonCenter"onClick={this.openShareModal.bind(this,data.name,data.slug,"Score")}>
								<a className="dropdown-item btn-primary" href="#shareCard" data-toggle="modal">
								<i className="fa fa-share-alt"></i>&nbsp;&nbsp;{"Share"}</a>
								</span>: ""}
					<div className="clearfix"></div>
					</li>
                    
                    </ul>
                    </div>
                    :""}
					
					
                    </div>
                    </div>
                     <Dialog ref={(el) => { this.dialog = el }} />

                    </div>
            )
        });
        return(<div >
                {
                    (appsScoreList.length>0)
                    ?(appsScoreList)
                    :(<div><div className="text-center text-muted xs-mt-50"><h2>No results found..</h2></div></div>)
                }

                </div>);
    }
    
}
