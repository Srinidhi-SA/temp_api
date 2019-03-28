import React from "react";
import { connect } from "react-redux";
import {isEmpty} from "../../helpers/helper";
import {STATIC_URL,EMR} from "../../helpers/env.js";
import {getAppsAlgoList,refreshAppsAlgoList,handleDeploymentDeleteAction,getAppDetails,} from "../../actions/appActions";
import Dialog from 'react-bootstrap-dialog';


@connect((store) => {
  return {
    login_response: store.login.login_response,
    dataPreview: store.datasets.dataPreview,
    selectedItem: store.datasets.selectedItem,
    featureEngineering:store.datasets.featureEngineering,
    deploymentList:store.apps.deploymentList,
		algoAnalysis:store.signals.algoAnalysis,
    

  };
})




export class Deployment extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
		// this.props.dispatch(getDeploymentList(getUserDetailsOrRestart.get().userToken, this.props.match.params.slug));

  }

  handleDeploymentDelete(slug) {
    var algoSlug= this.props.algoAnalysis.slug; 
    debugger;
    this.props.dispatch(handleDeploymentDeleteAction(slug, this.refs.dialog,algoSlug));
  }

  render() {
    if(isEmpty(this.props.deploymentList)){
			return ( 
        <div className="side-body">
          <div className="page-head">
          </div>
          <div className="main-content">
            <img id="loading" src={ STATIC_URL + "assets/images/Preloader_2.gif" } />
          </div>
        </div>
      );
		}else{
    console.log("Deployment render method is called...");
		var deploymentList = this.props.deploymentList;
    var deploymentTable = "";

if(deploymentList.data.length == 0){    
      return(
        deploymentTable = <h4 style={{textAlign:"center"}}>No Deployments Available</h4>
      );
    }
    else {
      deploymentTable = deploymentList.data.map((deploy,key )=> {
      return (
          <tr key={key} className={('all ' + deploy.name)}>
      <td>
         <label for="txt_lName1">{`${key + 1}`}&nbsp;&nbsp;&nbsp;</label>
      </td>
     <td className="text-left"> {deploy.name}</td>
     <td  className="text-left"> {deploy.name}</td>
     <td className="text-left"> {deploy.status}</td>
     <td ><span className="text-success"></span> {deploy.updated_at}</td>
     <td > {deploy.name}</td>
     <td > {deploy.name}</td>
     {/* <td > {deploy.name}</td> */}
     <td>
        <div class="pos-relative">
          <a class="btn btn-space btn-default btn-round btn-xs" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
            <i class="ci zmdi zmdi-hc-lg zmdi-more-vert"></i>
          </a>    
          <ul class="dropdown-menu dropdown-menu-right">
          <li><a bsStyle="cst_button">View</a></li>
            <li><a onClick={this.handleDeploymentDelete.bind(this, deploy.slug)}  >Delete</a></li>       
          </ul>
        </div>
      </td>
   </tr>);
   }) 
  }

    
    return (
      
			<div id="deployment" class="tab-pane">
				<button class="btn btn-warning btn-shade4 pull-right">Add New Deployment</button><br/><br/>
					<div class="clearfix"></div>
						<table class="tablesorter table table-striped table-hover table-bordered break-if-longText">
							<thead>
								<tr className="myHead">
									<th>#</th>
									<th class="text-left"><b>Name</b></th>
									<th class="text-left"><b>Deployment Type</b></th>
									<th><b>Status</b></th>
									<th><b>Deployed On</b></th>
									<th><b>Runtime</b></th>
									<th><b>Jobs Triggered</b></th>
									<th><b>Action</b></th>
								</tr>
							</thead>
						<tbody>
							{deploymentTable}
						</tbody>
					</table>
                    <Dialog ref="dialog"/>

			  </div>
    );
  }
}
  }