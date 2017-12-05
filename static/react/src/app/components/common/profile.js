import React from "react";
import { Scrollbars } from 'react-custom-scrollbars';
import {connect} from "react-redux";
import ReactDOM from "react-dom";
import {Link} from "react-router-dom";
import store from "../../store";
import {isEmpty,getUserDetailsOrRestart} from "../../helpers/helper";
var dateFormat = require('dateformat');
import Breadcrumb from 'react-breadcrumb';
import {STATIC_URL,API} from "../../helpers/env";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import {saveFileToStore} from "../../actions/dataSourceListActions";
import Dropzone from 'react-dropzone'
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import {openImg,closeImg,uploadImg,getUserProfile,saveProfileImage} from "../../actions/loginActions";

@connect((store) => {
  return {login_response: store.login.login_response,
          profileInfo: store.login.profileInfo,
          fileUpload:store.dataSource.fileUpload,
          showModal:store.dataUpload.imgUploadShowModal,
          profileImgURL:store.login.profileImgURL
          };
})

export class Profile extends React.Component {
  constructor(props) {
    super(props);
    console.log(props)
  }
  componentWillMount() {
    if (isEmpty(this.props.profileInfo))
      this.props.dispatch(getUserProfile(getUserDetailsOrRestart.get().userToken))
    if(this.props.profileImgURL=="")
    this.props.dispatch(saveProfileImage(getUserDetailsOrRestart.get().image_url))

  }

  componentDidMount() {

 // $('.crop').click(function() {
 //    $(this).toggleClass('crop active');
 //  });

  }
  popupMsg(){
		bootbox.alert("Only PNG and JPEG files are allowed to upload")
	}
  popupMsgForSize(){
    bootbox.alert("Maximum allowed file size is 2MB")
  }
  onDrop(files) {
		this.props.dispatch(saveFileToStore(files))
	}
  openPopup(){
    this.props.dispatch(openImg());
    var files = [{name:"",size:""}]
    this.props.dispatch(saveFileToStore(files))

  }
  closePopup(){
    this.props.dispatch(closeImg())
  }

  uploadProfileImage(){
    this.props.dispatch(uploadImg());
  }

//in your component
addDefaultSrc(ev){
  ev.target.src = '../assets/images/iconp_default.png'
}
  render() {
	   let lastLogin = null;
	  // alert(sessionStorage.last_login)
	  if(getUserDetailsOrRestart.get().last_login != "null"){
		  lastLogin = dateFormat(getUserDetailsOrRestart.get().last_login, "mmm d,yyyy");
	  }else{
		  lastLogin = dateFormat(new Date(), "mmm d,yyyy");
	  }

    if (isEmpty(this.props.profileInfo)) {
      return (
        <div className="side-body">
          {/*<!-- Page Title and Breadcrumbs -->*/}
          <div className="page-head">

            <h4>User Profile</h4>

          </div>
          <div className="main-content">
            <div>
              <img id="loading" src={STATIC_URL + "assets/images/Preloader_2.gif"}/>
            </div>
          </div>
        </div>
      )
    } else {
      console.log("profile info!!")
      console.log(this.props)
      //console.log(this.props.profileInfo.info)
      var fileName = store.getState().dataSource.fileUpload.name;
      var fileSize = store.getState().dataSource.fileUpload.size;
      let fileSizeInKB = (fileSize / 1024).toFixed(3)
      if(fileSizeInKB>2000)
      this.popupMsgForSize()
      let imgSrc = API+this.props.profileImgURL+fileSizeInKB+new Date().getTime();
      if(!this.props.profileImgURL)
      imgSrc = STATIC_URL + "assets/images/avatar.png"
      let statsList = this.props.profileInfo.info.map((analysis, i) => {
        console.log(analysis)
        return (
          <div key={i} className="col-md-2 co-sm-4 col-xs-6">
            <h2 className="text-center text-primary">{analysis.count}<br/>
              <small>{analysis.displayName}
              </small>
            </h2>
          </div>
        )
      });
	  // Recent Activity Block
	  let recentActivity = this.props.profileInfo.recent_activity.map((recAct, i) => {
        console.log(recAct);
		let img_name ="../assets/images/iconp_" + recAct.content_type + ".png";
		//console.log(img_name);
        return (
          <li key={i}>
				<img  onError={this.addDefaultSrc} src={img_name} className="img-responsive pull-left xs-pl-5 xs-pr-10" />
				<span>
				<div class="crop">{recAct.message_on_ui}</div>
				</span>
				<span className="pull-right">
				{dateFormat(recAct.action_time, "mmm d,yyyy")}
				</span>
          </li>
        )
      });
      return (
        <div className="side-body">
          <div className="page-head">
            <div className="row">
              <div className="col-md-8">
                <h3 className="xs-mt-0 text-capitalize">User Profile</h3>
              </div>
            </div>
          </div>
          {/*<!-- /.Page Title and Breadcrumbs -->

            <!-- Page Content Area -->*/}
          <div className="main-content">
            <div className="user-profile">
			<div className="panel panel-default xs-mb-15">
			<div className="panel-body">
              <div className="user-display">
                <div className="user-avatar col-md-2 text-center">
                <img src={imgSrc} className="img-responsive img-center img-circle"/>
                <a onClick={this.openPopup.bind(this)} href ="javascript:void(0)"><i class="fa fa-camera" style={{fontSize:"36px",color:"grey"}}></i></a>
                <div id="uploadImg" role="dialog" className="modal fade modal-colored-header">
                <Modal show={store.getState().dataUpload.imgUploadShowModal} onHide={this.closePopup.bind(this)} dialogClassName="modal-colored-header uploadData">
                <Modal.Header closeButton>
                <h3 className="modal-title">Upload Image</h3>
                </Modal.Header>
                <Modal.Body>




				<div className="row">
					<div className="col-md-9 col-md-offset-1 col-xs-12">
                <div className="clearfix"></div>
                <div className="xs-pt-20"></div>

						 <div className="dropzone md-pl-50">
                <Dropzone id={1} onDrop={this.onDrop.bind(this)} accept=".png, .jpg" onDropRejected={this.popupMsg}>
                <p>Try dropping some files here, or click to select files to upload.</p>
                </Dropzone>
                {/*<aside>
                      <ul className={fileName != "" ? "list-unstyled bullets_primary":"list-unstyled"}>
                          <li>{fileName}{fileName != "" ? " - ":""}{fileSizeInKB}{fileName != "" ? " KB ":""}</li>
                      </ul>
                    </aside>*/}
                    <aside>
                          <ul className={fileName != "" ? "list-unstyled bullets_primary":"list-unstyled"}>
                              <li>{fileName}</li>
                          </ul>
                        </aside>
                </div>

				 <div className="xs-pt-10"></div>
               <div className="clearfix"></div>


                </div>
				</div>
                </Modal.Body>
                <Modal.Footer>
                <Button onClick={this.closePopup.bind(this)}>Close</Button>
                  <Button bsStyle="primary" onClick={this.uploadProfileImage.bind(this)}>Upload Image</Button>
                </Modal.Footer>
                </Modal>
                </div>
                </div>

                <div className="user-info col-md-10">

                  <div className="panel-default">

                    <div className="panel-body">
                      <div className="row">
                        <div className="col-md-6">
                          <h3>{getUserDetailsOrRestart.get().userName}</h3>
                          <table className="full-table-width no-border no-strip skills">
                            <tbody className="no-border-x no-border-y full-width">
                              <tr>
                                <td className="item" width="30">
                                  <span className="fa fa-envelope"></span>
                                </td>
                                <td>
                                  <b>
                                    {getUserDetailsOrRestart.get().email}</b>
                                </td>
                              </tr>
                              <tr>
                                <td className="item xs-pt-5">
                                  <span className="fa fa-phone"></span>
                                </td>
                                <td className="xs-pt-5">
                                  <b>
                                    {getUserDetailsOrRestart.get().phone}
                                  </b>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
						<div className="col-md-6 text-right">
                    <p className="xs-pt-30">
                      Date Joined :
                      <b> {dateFormat(getUserDetailsOrRestart.get().date, "mmm d,yyyy")}</b>
                      <br/>
                      Last Login :
                      <b>{lastLogin}</b>
                      {/*<br/>
                    Subscription Left :
                    <b>25 Days</b>*/}
                    <br/>
                    Superuser status:
                    <b>{getUserDetailsOrRestart.get().is_superuser}</b>

                    </p>
                  </div>
                        {/*<div className="col-md-4 text-right xs-p-20">
                                 <a href="#" className="btn btn-primary">Edit Profile</a>
                               </div>*/}
                      </div>

                    </div>
                  </div>
                </div>
                <div className="clearfix"></div>
              </div>
			 <div className="clearfix"></div>
              <div className="row text-center">

                {statsList}
              </div>
			  </div>
            </div>
			 </div>
            <div className="row">
              <div className="col-md-4">
			  <div className="panel">
				<div className="panel-body">
                <div className="minHP">
                  <h5 class="text-center">TOTAL SPACE</h5>
                  <C3Chart classId="_profile" data={this.props.profileInfo.chart_c3}/> {/*
              <img src="images/userProfileGraph.png" className="img-responsive"/>*/}
			  <p className="xs-pl-20">{renderHTML(this.props.profileInfo.comment)}</p>
                </div>
				</div>
				</div>
              </div>
              <div className="col-md-8">
                <div className="row">
                  <div className="col-md-12 text-right hidden">
                    <p className="xs-p-20">
                    <br/>
                      Date Joined :
                      <b> {dateFormat(getUserDetailsOrRestart.get().date, "mmm d,yyyy")}</b>
                      <br/>
                      Last Login :
                      <b>{lastLogin}</b>
                      {/*<br/>
                    Subscription Left :
                    <b>25 Days</b>*/}
                    <br/>
                    Superuser status:
                    <b>{getUserDetailsOrRestart.get().is_superuser}</b>

                    </p>
                  </div>
                  <div className="clearfix"></div>
                  <div className="col-md-12">
					<div className="panel">
					<div className="panel-body">
                    <div className="minHP">
					<h5>RECENT ACTIVITY</h5>
					<Scrollbars style={{ height: 312 }} renderTrackHorizontal={props => <div {...props} className="track-horizontal" style={{display:"none"}}/>}
        renderThumbHorizontal={props => <div {...props} className="thumb-horizontal" style={{display:"none"}}/>}>

						<ul className="list-unstyled list-border recActivity">
						{recentActivity}
						</ul>
                    </Scrollbars>
                    </div>
					</div>
					</div>
				  </div>
                  {/*  <div className="col-md-4">
                  <div className="panel text-center xs-p-20 minHP">
                    <a href="#">
                      <img src="images/launch_icon.png"/><br/>
                      UPGRADE ACCOUNT SERVICE
                    </a>
                  </div>
                </div>*/}
                  <div className="clearfix"></div>
                </div>
              </div>

            </div>
		  </div>
        </div>

      );
    }

  }
}
