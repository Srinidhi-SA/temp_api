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
import {getAppsRoboList, getRoboDataset, handleInsightDelete, handleInsightRename, storeRoboSearchElement,clearRoboSummary,storeRoboSortElements} from "../../actions/appActions";
import {DetailOverlay} from "../common/DetailOverlay";
import {STATIC_URL} from "../../helpers/env.js";
import {RoboDataUpload} from "./RoboDataUpload";
import {AppsLoader} from "../common/AppsLoader";
import Dialog from 'react-bootstrap-dialog'
import {SEARCHCHARLIMIT,getUserDetailsOrRestart} from "../../helpers/helper"

var dateFormat = require('dateformat');

@connect((store) => {
  return {
    login_response: store.login.login_response,
    roboList: store.apps.roboList,
    currentAppId: store.apps.currentAppId,
    showRoboDataUploadPreview: store.apps.showRoboDataUploadPreview,
    roboDatasetSlug: store.apps.roboDatasetSlug,
    roboSummary: store.apps.roboSummary,
    dataPreviewFlag: store.datasets.dataPreviewFlag,
    robo_search_element: store.apps.robo_search_element,
    customerDataset_slug:store.apps.customerDataset_slug,
    historialDataset_slug:store.apps.historialDataset_slug,
    externalDataset_slug:store.apps.externalDataset_slug,
  };
})

export class RoboInsightCard extends React.Component {
  constructor(props) {
    super(props);
  }

  getInsightPreview(slug) {
    this.props.dispatch(clearRoboSummary());
    this.props.dispatch(getRoboDataset(slug));
  }
  handleInsightRename(slug, name) {
    this.props.dispatch(handleInsightRename(slug, this.refs.dialog, name))
  }
  handleInsightDelete(slug) {
    this.props.dispatch(handleInsightDelete(slug, this.refs.dialog))
  }

  render() {
      const roboList = this.props.data;
      let addButton = <RoboDataUpload match={this.props.match}/>

      const appsRoboList = roboList.map((data, i) => {
        var modelLink = "/apps-robo-list/" + data.slug+"/customer/data/"+data.customer_dataset;
        return (
          <div className="col-md-3 top20 list-boxes" key={i}>
            <div className="rep_block newCardStyle" name={data.name}>
              <div className="card-header"></div>
              <div className="card-center-tile">
                <div className="row">
                
                  <div className="col-xs-12">
                    <h5 className="title newCardTitle pull-left">
                        <Link id={data.slug} onClick={this.getInsightPreview.bind(this, data.slug)} to={modelLink}>{data.name}</Link>
                    </h5>
                    <div class="btn-toolbar pull-right">
                {/*<!-- Rename and Delete BLock  -->*/}
                  <a className="dropdown-toggle more_button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
                    <i className="ci zmdi zmdi-hc-lg zmdi-more-vert"></i>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                    <li onClick={this.handleInsightRename.bind(this, data.slug, data.name)}>
                      <a className="dropdown-item" href="#renameCard" data-toggle="modal">
                        <i className="fa fa-edit"></i>
                        &nbsp;&nbsp;Rename</a>
                    </li>
                    <li onClick={this.handleInsightDelete.bind(this, data.slug)}>
                      <a className="dropdown-item" href="#deleteCard" data-toggle="modal">
                        <i className="fa fa-trash-o"></i>
                       &nbsp;&nbsp; Delete</a>
                    </li>
                  </ul>
                  {/*<!-- End Rename and Delete BLock  -->*/}
                    </div>
                    
                    <div className="clearfix"></div>
             
                    
                     {/*<!-- Popover Content link -->*/}
                  <OverlayTrigger trigger="click" rootClose placement="left" overlay={< Popover id = "popover-trigger-focus" > <DetailOverlay details={data}/> </Popover>}>
                    <a className="pover cursor">
                    <div class="card_icon">
                      <img src={STATIC_URL + "assets/images/apps_model_icon.png"} alt="LOADING"/>
                    </div>
                    </a>
                  </OverlayTrigger>
                    
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <div className="left_div">
                  <span className="footerTitle"></span>{getUserDetailsOrRestart.get().userName}
                  <span className="footerTitle">{dateFormat(data.created_at, "mmm d,yyyy HH:MM")}</span>
                </div>                 
              </div>
            </div>
          </div>
        )
      });
        
      return( <div>
              {
                 (appsRoboList.length>0)
                 ?(appsRoboList)
                 :(<div><div className="clearfix"></div><div className="text-center text-muted xs-mt-50"><h2>No results found..</h2></div></div>)
                 }
              </div>);
    }
}
