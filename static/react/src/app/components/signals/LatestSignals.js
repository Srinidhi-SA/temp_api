import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import store from "../../store";
import {getAllDataList,getDataSetPreview,storeSignalMeta,showDataPreview} from "../../actions/dataActions";
import {isEmpty} from "../../helpers/helper";
import {CreateSignal} from "./CreateSignal";
import {SignalCard} from "./SignalCard";

@connect((store) => {
    return {login_response: store.login.login_response,
        latestSignalList: store.signals.latestSignals,};
})

//var selectedData = null;
export class LatestSignals extends React.Component {
    constructor(props) {
        super(props);
        this.props=props;
    }
    
    componentWillMount(){
        
    }
    
    render() {
        var data = this.props.latestSignalList;
        let addButton = addButton = <CreateSignal url={this.props.props.match.url}/>;
        let latestSignals = "";
        if(data){
            latestSignals =  <SignalCard data={data}/>;
        }
        return (
                
                <div class="dashboard_head">
                
                <div class="page-head">
                <h3 class="xs-mt-0">Signals</h3>
                </div>
                <div class="active_copy">
                <div class="row">
                
                {addButton}
                {latestSignals}
                </div>
                
                </div>
                </div>
                
        );
    }
    
}
