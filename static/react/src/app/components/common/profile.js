import React from "react";
import {connect} from "react-redux";
import ReactDOM from "react-dom";
import {Link} from "react-router-dom";
import store from "../../store";
import {getList,emptySignalAnalysis,handleDelete} from "../../actions/signalActions";
var dateFormat = require('dateformat');

import Breadcrumb from 'react-breadcrumb';


@connect((store) => {
  return {login_response: store.login.login_response, signalList: store.signals.signalList.data, selectedSignal: store.signals.signalAnalysis};
})

export class Profile extends React.Component {
  constructor(props) {
    super(props);
	console.log(props)
  }
  componentWillMount() {
	  
  }

  componentDidMount() {

  }

  
 
  render() {
       
        return (
		<div className="side-body">
		<div className="main-content">
		  <div className="user-profile"> 
			 <div className="user-display">
               <div className="photo">&nbsp;</div>
              <div className="bottom">
                <div className="user-avatar"><img src="../assets/images/avatar.png" /></div>
                <div className="user-info">
                  
				  <div className="info-block panel panel-default">
                  <div className="panel-heading">
                    <h4>{sessionStorage.userName}</h4>
                  </div>
                  <div className="panel-body">
				  <table className="no-border no-strip skills">
                      <tbody className="no-border-x no-border-y">
                        <tr>
                          <td className="item"><span className="fa fa-envelope fa-lg"></span>{sessionStorage.email}</td>
                         
                        </tr>
                        <tr>
                          <td className="item"><span className="fa fa-user fa-lg"></span> {dateFormat(sessionStorage.date, "dd mmmm yyyy")}</td>
                           
                        </tr>
                        <tr>
                          <td className="item"><span className="fa fa-phone-square fa-lg"></span> (999) 999-9999</td>
                          
                        </tr> 
                        
                      </tbody>
                    </table>
				  </div>
				  </div>
                </div>
              </div>
            </div>
			 
			
			
          </div>
	</div>
	</div>

          );
  
	
	
}
}
