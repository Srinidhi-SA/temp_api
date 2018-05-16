import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {
    Pagination,
    Tooltip,
    OverlayTrigger,
    Popover,
    Modal,
    Button
  } from "react-bootstrap";
import store from "../../store";
import {getAllDataList,getDataSetPreview,storeSignalMeta,showDataPreview} from "../../actions/dataActions";
import {isEmpty, SUCCESS,INPROGRESS,getUserDetailsOrRestart} from "../../helpers/helper";
import {
    getList,
    emptySignalAnalysis,
    handleDelete,
    handleRename,
    storeSearchElement,
    storeSortElements,
    fetchCreateSignalSuccess,
    triggerSignalAnalysis,
    emptySignalData,
    refreshSignals,
    updateHide,
    updateTargetTypForSelSignal
  } from "../../actions/signalActions";
import {STATIC_URL} from "../../helpers/env";
import {DetailOverlay} from "../common/DetailOverlay";
var dateFormat = require('dateformat');
import Dialog from 'react-bootstrap-dialog';
import {openCsLoaderModal, closeCsLoaderModal} from "../../actions/createSignalActions"

@connect((store) => {
    return { login_response: store.login.login_response,
        signalList: store.signals.signalList.data,
        latestSignals:store.signals.latestSignals};
})

//var selectedData = null;
export class SignalCard extends React.Component {
    constructor(props) {
        super(props);
        this.props=props;
    }
    getSignalAnalysis(signalType,e) {
        console.log("Link Onclick is called")
        console.log(e.target.id);
        this.props.dispatch(emptySignalAnalysis());
        //this.props.dispatch(updateTargetTypForSelSignal(signalType));
      }
    handleDelete(slug,evt) {
        this.props.dispatch(handleDelete(slug, this.dialog,evt));
      }

      handleRename(slug, name) {
        this.props.dispatch(handleRename(slug, this.dialog, name));
      }
      openLoaderScreen(slug, percentage, message, e) {
          var signalData = {};
          signalData.slug = slug
          this.props.dispatch(openCsLoaderModal());
          this.props.dispatch(updateHide(true))
          this.props.dispatch(emptySignalAnalysis());
          this.props.dispatch(triggerSignalAnalysis(signalData, percentage, message));

          //this.props.history.push('/signals/'+slug);
        }
    render() {

        var listData = this.props.data;
        console.log(listData)

        const storyListDetails = listData.map((story, i) => {
            var iconDetails = "";
            var percentageDetails = "";
            var signalType=story.type
            var signalLink = "/signals/" + story.slug;
            var completed_percent = story.completed_percentage
            if(completed_percent>99)
            completed_percent=99
            var signalClick = <Link to={signalLink} id={story.slug} onClick={this.getSignalAnalysis.bind(this)} className="title">
              {story.name}
              </Link>
              if(story.status == INPROGRESS){
                  percentageDetails =   <div class=""><i className="fa fa-circle inProgressIcon"></i><span class="inProgressIconText">&nbsp;{completed_percent >= 0 ? completed_percent+' %':"In Progress"}&nbsp;</span></div>
                  signalClick = <a class="cursor" onClick={this.openLoaderScreen.bind(this,story.slug,completed_percent,story.completed_message)}> {story.name}</a>
              }else if(story.status == SUCCESS && !story.viewed){
                  story.completed_percentage = 100;
                  percentageDetails =   <div class=""><i className="fa fa-check completedIcon"></i><span class="inProgressIconText">&nbsp;{story.completed_percentage}&nbsp;%</span></div>
              }

              if (story.type == "dimension") {
                  var imgLink = STATIC_URL + "assets/images/s_d_carIcon.png"
              } else {
                  var imgLink = STATIC_URL + "assets/images/s_m_carIcon.png"
              }
              iconDetails = <img src={imgLink} alt="LOADING"/>
              var permissionDetails = story.permission_details;
              var isDropDown = permissionDetails.remove_signal || permissionDetails.rename_signal;

            return (
              <div className="col-md-3 xs-mb-15 list-boxes" key={i}>
                <div className="rep_block newCardStyle" name={story.name}>
                  <div className="card-header"></div>
                  <div className="card-center-tile">
                    <div className="row">
                      <div className="col-xs-12">
                        <h5 className="title newCardTitle pull-left">
                          {signalClick}
                        </h5>
                        {
                            isDropDown == true ? <div class="btn-toolbar pull-right">
                             {/*<!-- Rename and Delete BLock  -->*/}
                      <a className="dropdown-toggle more_button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
                        <i className="ci zmdi zmdi-hc-lg zmdi-more-vert"></i>
                      </a>
                      <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                     {permissionDetails.rename_signal == true ?
                        <li onClick={this.handleRename.bind(this, story.slug, story.name)}>
                          <a className="dropdown-item" href="#renameCard" data-toggle="modal">
                            <i className="fa fa-edit"></i>&nbsp;&nbsp;Rename</a>
                        </li>:""}
{permissionDetails.remove_signal == true ?
                        <li onClick={this.handleDelete.bind(this, story.slug)}>
                          <a className="dropdown-item" href="#deleteCard" data-toggle="modal">
                            <i className="fa fa-trash-o"></i>&nbsp;&nbsp;{story.status == "INPROGRESS"
                              ? "Stop and Delete "
                              : "Delete"}</a>
                        </li> :""}
                      </ul>
                      {/*<!-- End Rename and Delete BLock  -->*/}
                          </div>:<div class="btn-toolbar pull-right"></div>
                        }

                          <div className="clearfix"></div>

                          {percentageDetails}
                        {/* <div class="inProgressIcon">
                               <i class="fa fa-circle"></i>
                               <span class="inProgressIconText">&nbsp;{story.completed_percentage}&nbsp;%</span>
                        </div>*/}

                        <OverlayTrigger trigger="click" rootClose placement="left" overlay={< Popover id = "popover-trigger-focus" > <DetailOverlay details={story}/> </Popover>}>
                        <a className="pover cursor">
                        <div class="card_icon">
                        {iconDetails}
                        </div></a>
                        </OverlayTrigger>

                      </div>

                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="left_div">
                      <span className="footerTitle"></span>{getUserDetailsOrRestart.get().userName}
                      <span className="footerTitle footerTitle">{dateFormat(story.created_at, "mmm d,yyyy HH:MM")}</span>
                    </div>


                    {/*popover*/}

                  </div>
                </div>
                   <Dialog ref={(el) => { this.dialog = el }}/>
              </div>
            )
          });
             return( <div>
           {
              (storyListDetails.length>0)
              ?(storyListDetails)
              :(<div><div className="text-center text-muted xs-mt-50"><h2>No results found..</h2></div></div>)
              }
           </div>);
    }


}
