import React from "react";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {Modal,Button,Tab,Row,Col,Nav,NavItem,Form,FormGroup,FormControl} from "react-bootstrap";

import {C3Chart} from "../c3Chart";
import {DataVariableSelection} from "../data/DataVariableSelection";
import {updateTrainAndTest,createScore,getAppsModelSummary,getAppDetails} from "../../actions/appActions";
import {AppsLoader} from "../common/AppsLoader";
import {getDataSetPreview,deselectAllVariablesDataPrev,makeAllVariablesTrueOrFalse} from "../../actions/dataActions";
import {statusMessages} from "../../helpers/helper";

@connect((store) => {
    return {login_response: store.login.login_response,
        dataPreview: store.datasets.dataPreview,
        modelTargetVariable:store.apps.modelTargetVariable,
        selectedAlg:store.apps.selectedAlg,
        scoreSummaryFlag:store.apps.scoreSummaryFlag,
        currentAppId:store.apps.currentAppId,
        selectedVariablesCount: store.datasets.selectedVariablesCount,
        currentAppDetails:store.apps.currentAppDetails,
    };
})

export class ScoreVariableSelection extends React.Component {
    constructor(props) {
        super(props);

    }
    createScore(event){
        event.preventDefault();
        if(this.props.match.path.includes("/createScore") && store.getState().apps.currentAppDetails != null && store.getState().apps.currentAppDetails.app_type == "REGRESSION"){
            if(this.props.selectedVariablesCount < 4 || this.props.selectedVariablesCount > 10){
                let msg= statusMessages("warning","Number of variables selected should be 4 to 10","small_mascot");
                bootbox.alert(msg);
                return false;
            }
        }
        this.props.dispatch(createScore($("#createScoreName").val(),$("#createScoreAnalysisList").val()))
    }
    componentWillMount() {
        //It will trigger when refresh happens on url
        this.props.dispatch(getAppDetails(this.props.match.params.AppId));
        if(this.props.dataPreview == null){
            this.props.dispatch(getDataSetPreview(this.props.match.params.slug));
            this.props.dispatch(getAppsModelSummary(this.props.match.params.modelSlug));

        }
    }

    render() {
        console.log("Create Score Variable Selection  is called##########3");
        if(store.getState().apps.scoreSummaryFlag){
            let _link = "/apps/"+this.props.match.params.AppId+'/scores/'+store.getState().apps.scoreSlug;
            return(<Redirect to={_link}/>);
        }

        let dataPrev = store.getState().datasets.dataPreview;
        let renderSelectBox = null;
        if(dataPrev){
            const metaData =  dataPrev.meta_data.uiMetaData.varibaleSelectionArray;
            if(metaData){
                renderSelectBox =  <select disabled className="form-control" id="createScoreAnalysisList">
                <option key={store.getState().apps.modelTargetVariable} value={store.getState().apps.modelTargetVariable}>{store.getState().apps.modelTargetVariable}</option>
                </select>
            }
        }

        return(
                <div className="side-body">
                <div className="page-head">
                <h3 class="xs-mt-0 text-capitalize">Variable Selection</h3>
                <div className="clearfix"></div>
                </div>
                <div className="main-content">

                <div className="panel panel-default box-shadow">
                <div className="panel-body">
                <Form onSubmit={this.createScore.bind(this)} className="form-horizontal">
                <FormGroup role="form">
                

                
                <label className="control-label cst-fSize">I want to analyse</label>
                <div className="col-lg-4"> {renderSelectBox}</div>
                
                 {/*<!-- /.col-lg-4 -->*/}
                 </FormGroup>
				 
				<FormGroup role="form">
                <DataVariableSelection match={this.props.match}/>
				</FormGroup>
				
				<FormGroup role="form">
				<div className="col-lg-5 col-lg-offset-7">
				<div class="input-group xs-mb-15">
                        <input type="text" name="createScoreName" required={true} id="createScoreName" className="form-control" placeholder="Create Score Name"/><span class="input-group-btn">
                          <button type="submit" class="btn btn-primary">Score Model</button></span>
                 </div>
				</div>
                </FormGroup>
				
                </Form>
                </div>
                </div>
                </div>
                <AppsLoader match={this.props.match}/>
                </div>
        );
    }
}