import React from "react";
import store from "../../store";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";

import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab,Pagination,Tooltip,OverlayTrigger,Popover} from "react-bootstrap";
import {AppsCreateModel} from "./AppsCreateModel";
import {getAppsModelList,getAppsModelSummary,updateModelSlug,updateScoreSummaryFlag,
    updateModelSummaryFlag,handleModelDelete,handleModelRename,storeModelSearchElement,storeAppsModelSortElements} from "../../actions/appActions";
 import {DetailOverlay} from "../common/DetailOverlay";
 import {SEARCHCHARLIMIT,getUserDetailsOrRestart} from  "../../helpers/helper"
 import {STATIC_URL} from "../../helpers/env.js";
 import Dialog from 'react-bootstrap-dialog'
    var dateFormat = require('dateformat');
 import {ModelsCard} from "./ModelsCard";
 
@connect((store) => {
    return {login_response: store.login.login_response,
        latestModels: store.apps.latestModels,};
})

//var selectedData = null;
export class LatestModels extends React.Component {
    constructor(props) {
        super(props);
        this.props=props;
    }
   
    render() {
        var data = this.props.props.modelList.data;
        if(data.length<=3){
            data = this.props.props.modelList.data;
        }else if(data.length>3){
            data = this.props.props.modelList.data.slice(0,3);
        }
        let addButton  = "";
        addButton  = <AppsCreateModel match={this.props.props.match} isEnableCreate={this.props.permissions.create_trainer}/>;
        let latestModels = "";
        if(data){
            latestModels =  <ModelsCard match = {this.props.props.match} data={data}/>;
        }
        return (
                <div class="dashboard_head">
           
                <div class="active_copy apps-cards">
                <div class="row">
                {addButton}
                {latestModels}
                </div>
                </div>
                </div>
                
        );
    }
    
}
