import React from "react";
import {NavLink, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {updateAnalystModeSelectedFlag} from "../../actions/appActions"
import {hideDataPreview, getDataList,storeSearchElement_data} from "../../actions/dataActions";
import {getList,storeSearchElement,emptySignalAnalysis} from "../../actions/signalActions";
import {getUserDetailsOrRestart} from "../../helpers/helper";
import {APPS_ALLOWED,ENABLE_KYLO_UI} from "../../helpers/env.js";
import ReactNotifications from 'react-browser-notifications';

@connect((store) => {
  return {dataPreviewFlag: store.datasets.dataPreviewFlag,
          apps_regression_modelName: store.apps.apps_regression_modelName,
  };
})

class LeftPanel extends React.Component {

  constructor(props) {
    super(props);
  }
  componentDidMount() {
    if(this.props.location.pathname.indexOf("/apps-") >= 0)
    $('.navbar-nav')[0].childNodes[1].childNodes[0].className = " sdb sdb_app active";
  }
 
  hideDataPrev(e) {
    this.props.dispatch(updateAnalystModeSelectedFlag(false));
    this.props.dispatch(hideDataPreview());
    this.props.dispatch(emptySignalAnalysis());
    this.props.dispatch(getList(getUserDetailsOrRestart.get().userToken, 1));
    this.props.dispatch(getDataList(1));
  }
  showNotifications= () => {
    if(this.n.supported()) this.n.show();
  }

  handleClick =(event)=> {
    window.focus()
    this.n.close(event.target.tag);
  }
  render() {
    let notifyBody= this.props.apps_regression_modelName + " model created successfully."
    let view_data_permission=getUserDetailsOrRestart.get().view_data_permission
    let view_signal_permission = getUserDetailsOrRestart.get().view_signal_permission
    let view_trainer_permission = getUserDetailsOrRestart.get().view_trainer_permission
    let view_score_permission = getUserDetailsOrRestart.get().view_score_permission
    let enable_kylo = ENABLE_KYLO_UI
    return (
      <div>
        <div>
        <ReactNotifications
              onRef={ref => (this.n = ref)}
			        title="mAdvisor"
			        body= {notifyBody}
			        icon= "devices-logo.png"
			        tag="abcdef"
			        onClick={event => this.handleClick(event)}
		        />
		        <button className="notifyBtn noDisplay" onClick={this.showNotifications}>Notify Me!</button>
         
          <div className="side-menu collapse navbar-collapse" id="side-menu">
            <div className="side-menu-container">
              <ul className="nav navbar-nav">
              {(view_signal_permission=="true")?
                <li>
                  <NavLink id="signalTab" onClick={this.hideDataPrev.bind(this)} activeClassName="active" className="sdb" to="/signals">
                    <i className="fa fa-podcast fa-2x" aria-hidden="true"></i><br />
                    Signal</NavLink>
                </li>:<li className="notAllowed" title="Access Denied">
                  <NavLink id="signalTab" className="sdb sdb_signal deactivate" to="/signals">
                    <span></span>
                    Signal</NavLink>
                </li>}
                {(APPS_ALLOWED==true)?
                <li>
                  <NavLink id="appsTab" onClick={this.hideDataPrev.bind(this)} activeClassName="active" isActive={(match,location) => /^[/]apps/.test(location.pathname)} className=" sdb" to="/apps">
                     <i className="fa fa-cubes fa-2x" aria-hidden="true"></i><br />
                    Apps</NavLink>
                </li>:""}
                {(view_data_permission=="true")?
                <li>
                  <NavLink id="dataTab" onClick={this.hideDataPrev.bind(this)} activeClassName="active" className="sdb" to="/data">
                    <i className="fa fa-database fa-2x" aria-hidden="true"></i><br />
                    Data</NavLink>
                </li>:<li className="notAllowed" title="Access Denied">
                  <NavLink id="dataTab" className="sdb sdb_data deactivate" to="/data">
                    <span></span>
                    Data</NavLink>
                </li>}
              
                  {(enable_kylo==true||enable_kylo=="True"||enable_kylo=="true")?<li>
                    <NavLink onClick={this.hideDataPrev.bind(this)} activeClassName="active" isActive={(match,location) => /^[/]datamgmt/.test(location.pathname)} className=" sdb" to="/datamgmt">
                      <i className="fa fa-folder-open fa-2x" aria-hidden="true"></i><br />
                      Data<br />manage</NavLink>
                  </li>:<div/>}

                
                 <li>
                  <NavLink onClick={this.hideDataPrev.bind(this)} target="_blank" activeClassName="active" className="sdb" to="/static/userManual/UserManual.html">
                    <i className="fa fa-question-circle fa-2x" aria-hidden="true"></i><br />
                    Help</NavLink>
                </li>


              </ul>
            </div>
          </div>
        </div>

      </div>

    );
  }
}
export default withRouter(LeftPanel);
