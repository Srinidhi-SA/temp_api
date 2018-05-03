import React from "react";
import {NavLink, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {hideDataPreview, getDataList,storeSearchElement_data} from "../../actions/dataActions";
import {getList,storeSearchElement,emptySignalAnalysis} from "../../actions/signalActions";
import {getUserDetailsOrRestart} from "../../helpers/helper"
import {APPS_ALLOWED} from "../../helpers/env.js"

@connect((store) => {
  return {dataPreviewFlag: store.datasets.dataPreviewFlag};
})

class LeftPanel extends React.Component {

  constructor(props) {
    super(props);
    console.log("checking this. refs:::")
    console.log(props);
  }
  componentDidMount() {
    console.log("Main side navbar props:::");
    console.log(this);
    if(this.props.location.pathname.indexOf("/apps-") >= 0)
    $('.navbar-nav')[0].childNodes[1].childNodes[0].className = " sdb sdb_app active";
  }
  componentWillUpdate() {
    //this.setState({currentTab: "otherTab"});
  }

  hideDataPrev(e) {
    this.props.dispatch(hideDataPreview());
    this.props.dispatch(emptySignalAnalysis());
    //clear all search elements
    //this.props.dispatch(storeSearchElement(""));
    //this.props.dispatch(storeSearchElement_data(""));
    this.props.dispatch(getList(getUserDetailsOrRestart.get().userToken, 1));
    this.props.dispatch(getDataList(1));
    /*$("."+e.target).addClass("active");
	$(".sdb").each(function(){
		$(this).removeClass("active");
	})*/

  }
  render() {
    console.log("LeftPanel")
    console.log(this.props);
    let view_data_permission=getUserDetailsOrRestart.get().view_data_permission
    let view_signal_permission = getUserDetailsOrRestart.get().view_signal_permission
    let view_trainer_permission = getUserDetailsOrRestart.get().view_trainer_permission
    let view_score_permission = getUserDetailsOrRestart.get().view_score_permission
    return (
      <div>
        <div>
          {/* Side bar Main Menu -->*/}
          <div className="side-menu">
            <div className="side-menu-container">
              <ul className="nav navbar-nav">
              {(view_signal_permission=="true")?
                <li>
                  <NavLink onClick={this.hideDataPrev.bind(this)} activeClassName="active" className="sdb sdb_signal" to="/signals">
                    <span></span>
                    SIGNALS</NavLink>
                </li>:<li className="notAllowed" title="Access Denied">
                  <NavLink className="sdb sdb_signal deactivate" to="/signals">
                    <span></span>
                    SIGNALS</NavLink>
                </li>}
                {/*  <li>
                    <NavLink className="sdb_story" to ="/stories">
                      <span></span>
                      STORY</NavLink>
                  </li>*/}
                {(APPS_ALLOWED==true)?
                <li>
                  <NavLink onClick={this.hideDataPrev.bind(this)} activeClassName="active" isActive={(match,location) => /^[/]apps/.test(location.pathname)} className=" sdb sdb_app" to="/apps">
                    <span></span>
                    APPS</NavLink>
                </li>:""}
                {(view_data_permission=="true")?
                <li>
                  <NavLink onClick={this.hideDataPrev.bind(this)} activeClassName="active" className="sdb sdb_data" to="/data">
                    <span></span>
                    DATA</NavLink>
                </li>:<li className="notAllowed" title="Access Denied">
                  <NavLink className="sdb sdb_data deactivate" to="/data">
                    <span></span>
                    DATA</NavLink>
                </li>}
                {/* <li>
                    <NavLink  onClick={this.hideDataPrev.bind(this)} activeClassName="active" className="sdb sdb_settings" to ="/settings">
                      <span></span>
                      SETTINGS</NavLink>
                  </li> */}
                  <li>
                    <NavLink onClick={this.hideDataPrev.bind(this)} activeClassName="active" isActive={(match,location) => /^[/]kylo/.test(location.pathname)} className=" sdb sdb_app" to="/kylo">
                      <span></span>
                      KYLO</NavLink>
                  </li>
              </ul>
            </div>
            {/* // /.Side bar Main Menu  -->*/}
          </div>
          {/*/ ./Side bar Main Menu -->

								            // Main Content starts with side-body -->*/}

        </div>

      </div>

    );
  }
}
export default withRouter(LeftPanel);
