import React from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";


// import {authenticateFunc,getList,storyList} from "../../services/ajax.js";
import store from "../../store";
import {getList} from "../../actions/signalActions";
import {BreadCrumb} from "../common/BreadCrumb";
import $ from "jquery";
var dateFormat = require('dateformat');

@connect((store) => {
  return {login_response: store.login.login_response, signalList: store.signals.signalList,
          selectedSignal: store.signals.signalAnalysis};
})

export class Signals extends React.Component {
  constructor() {
    super();
  }
  componentWillMount() {
    this.props.dispatch(getList(sessionStorage.userToken));
  }

  render() {
    console.log("signals is called##########3");
    // console.log(this.props);
    // console.log(store.getState().signals.signalList.errands)

    const data = store.getState().signals.signalList.errands;

    if (data) {
      console.log("under if data condition!!")
      const storyList = data.map((story, i) => {
        var signalLink = "/signals/" + story.id;
        return (
          <div className="col-md-3 top20 list-boxes" key={i}>
            <div className="rep_block newCardStyle" name={story.name}>
              <div className="card-header"></div>
              <div className="card-center-tile">
                <div className="row">
                  <div className="col-xs-9">
                    <h4 className="title newCardTitle">
                      <Link id={story.id} to={signalLink}>{story.name}</Link>
                    </h4>
                  </div>
                  <div className="col-xs-3">
                    <img src="assets/images/d_cardIcon.png" className="img-responsive" alt="LOADING"/>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <div className="left_div">
                  <span className="footerTitle"></span>{story.username}
                  <span className="footerTitle">{dateFormat(story.created_at, "mmmm d,yyyy h:MM")}</span>
                </div>

                <div className="card-deatils">
                  {/*<!-- Popover Content link -->*/}
                  <a href="#" rel="popover" className="pover" data-popover-content="#myPopover">
                    <i className="fa fa-info-circle fa-lg"></i>
                  </a>

                  {/*<!-- Rename and Delete BLock  -->*/}
                  <a className="dropdown-toggle more_button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
                    <i className="fa fa-ellipsis-v fa-lg"></i>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                    <li>
                      <a className="dropdown-item" href="#renameCard" data-toggle="modal">
                        <i className="fa fa-edit"></i> Rename</a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#deleteCard" data-toggle="modal">
                        <i className="fa fa-trash-o"></i> Delete</a>
                    </li>
                  </ul>
                  {/*<!-- End Rename and Delete BLock  -->*/}
                </div>
                {/*popover*/}
                <div id="myPopover" className="pop_box hide">
                  <h4>Created By :
                    <span className="text-primary">Harman</span>
                  </h4>
                  <h5>Updated on :
                    <mark>10.10.2017</mark>
                  </h5>
                  <hr className="hr-popover"/>
                  <p>
                    Data Set : kk<br/>
                    Variable selected : kk1<br/>
                    Variable type : sale</p>
                  <hr className="hr-popover"/>
                  <h4 className="text-primary">Analysis List</h4>
                  <ul className="list-unstyled">
                    <li>
                      <i className="fa fa-check"></i>
                      12</li>
                  </ul>
                  <a href="javascript:void(0)" class="btn btn-primary pull-right">View Story</a>
                  <div className="clearfix"></div>
                </div>
              </div>
            </div>
          </div>
        )
      });
      return (
        <div>
          <div className="side-body">
          { /* <MainHeader/>*/}
          <BreadCrumb/>
            <div className="main-content">
              {storyList}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>no signals</div>
      )
    }
  }
}
