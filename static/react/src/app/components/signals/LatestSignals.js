import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import store from "../../store";
import {getAllDataList,getDataSetPreview,storeSignalMeta,showDataPreview} from "../../actions/dataActions";
import {isEmpty} from "../../helpers/helper";
import {CreateSignal} from "./CreateSignal";


@connect((store) => {
    return {login_response: store.login.login_response,
        newSignalShowModal: store.signals.newSignalShowModal,
        allDataList: store.datasets.allDataSets,
        dataPreview: store.datasets.dataPreview,
        signalMeta: store.datasets.signalMeta,
        dataPreviewFlag:store.datasets.dataPreviewFlag};
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
        const current_page = store.getState().signals.signalList.current_page;
        let addButton = addButton = <CreateSignal url={this.props.match.url}/>
        return (
             
                <div class="dashboard_head">
                
                <div class="page-head">
                <div class="active_copy">
                <div class="row">
                
                {addButton}
                </div>
                
                </div>
                </div>
                </div>
        );
    }

}
