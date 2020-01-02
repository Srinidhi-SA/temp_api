import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import store from "../../store";
import {getAllDataList,getDataSetPreview,storeSignalMeta,showDataPreview} from "../../actions/dataActions";
import {isEmpty} from "../../helpers/helper";
import {DataUpload} from "./DataUpload";
import {DataCard} from "./DataCard";

@connect((store) => {
    return {login_response: store.login.login_response,
        latestDatasets: store.datasets.latestDatasets,};
})

//var selectedData = null;
export class LatestDatasets extends React.Component {
    constructor(props) {
        super(props);
        this.props=props;
    }
    
    componentWillMount(){
        
    }
    
    render() {
        var data = this.props.latestDatasets;
        let addButton = <DataUpload/>;
        let latestDatasets = "";
        if(data){
            latestDatasets =  <DataCard data={data} match={this.props.props.match}/>;
        }
        return (
                <div class="dashboard_head">
                <div class="page-head">
                <h3 class="xs-mt-0">Data</h3>
                </div>
                <div class="active_copy">
                <div class="row">
                {addButton}
                {latestDatasets}
                </div>
                </div>
                </div>
                
        );
    }
    
}
