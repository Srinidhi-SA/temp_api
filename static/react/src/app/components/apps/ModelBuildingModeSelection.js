import React from "react";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {Modal,Button,Tabs,Tab,Row,Col,Nav,NavItem,Form,FormGroup,FormControl} from "react-bootstrap";
import {createModel,getRegressionAppAlgorithmData,setDefaultAutomatic,updateAlgorithmData,checkAtleastOneSelected,saveParameterTuning,changeHyperParameterType} from "../../actions/appActions";
import {AppsLoader} from "../common/AppsLoader";
import {getDataSetPreview} from "../../actions/dataActions";
import {RegressionParameter} from "./RegressionParameter";
import {STATIC_URL} from "../../helpers/env.js";
import {statusMessages} from "../../helpers/helper";

@connect((store) => {
    return {login_response: store.login.login_response,
        dataPreview: store.datasets.dataPreview,
        modelTargetVariable:store.apps.modelTargetVariable,
        selectedAlg:store.apps.selectedAlg,
        scoreSummaryFlag:store.apps.scoreSummaryFlag,
        currentAppId:store.apps.currentAppId,
        automaticAlgorithmData:store.apps.regression_algorithm_data,
        manualAlgorithmData:store.apps.regression_algorithm_data_manual,
        isAutomatic:store.apps.regression_isAutomatic,
        apps_regression_modelName:store.apps.apps_regression_modelName,
        currentAppDetails:store.apps.currentAppDetails,
        modelSummaryFlag:store.apps.modelSummaryFlag,
    };
})

export class ModelBuildingModeSelection extends React.Component {
    componentWillMount() {
        //It will trigger when refresh happens on url
        if(this.props.apps_regression_modelName == "" || this.props.currentAppDetails == null){
            window.history.go(-1);
        }
    }
    componentDidMount() {
    }

    handleModeSelected(selectedMode="automl", event){
      var proccedUrl = this.props.match.url.replace('modeSelection','Proceed');
      if(selectedMode != "automl"){
        proccedUrl = this.props.match.url.replace('modeSelection','dataCleansing');
      }
      this.props.history.push(proccedUrl);

    }
    render() {
        return (
		 <div className="side-body">
			<div class="page-head">
			<h3 class="xs-mt-0 xs-mb-0 text-capitalize"> Please choose the modeling process.</h3>
			</div>
			<div className="row mod-processs">
                  <div className="col-md-4 col-md-offset-2">
                    <div className="mod-process mod-process-table-primary">
                      <div className="mod-process-title">For business users</div>
                       <div className="mod-process-table-img">
                       <img src={ STATIC_URL + "assets/images/mProcess_autoMlmode.png" } />
                      </div>
                      <p className="mProcess">
        			           Automatic ML modeling process that executes recommended set of data cleansing and transformation operations.
                </p>
                  <a href="javascript:;" className="btn btn-primary" onClick={this.handleModeSelected.bind(this,"automl")}>AUTO ML MODE</a></div>
                  </div>
                  <div className="col-md-4">
                    <div className="mod-process mod-process-table-primary">
                      <div className="mod-process-title">For analysts and data scientists</div>
                       <div className="mod-process-table-img">
                          <img src={ STATIC_URL + "assets/images/mProcess_automode.png" } />
                       </div>
                      <p className="mProcess">Robust set of data cleansing and feature transformation and generation options are provided.<br/></p>
        			           <a href="javascript:;" className="btn btn-primary" onClick={this.handleModeSelected.bind(this,"analystmode")}>ANALYST MODE</a>
                    </div>
                  </div>
                </div>
			</div>
				)


    }

}
