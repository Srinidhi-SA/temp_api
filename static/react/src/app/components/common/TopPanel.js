import React from "react";
import {Redirect} from 'react-router';
import {sessionObject} from '../../helpers/manageSessionStorage';
import LoadingBar from 'react-redux-loading-bar';
import {Link} from "react-router-dom";
import {cookieObj} from '../../helpers/cookiesHandler';
import {getUserDetailsOrRestart} from  "../../helpers/helper"
// import $ from 'jquery';

// import store from "../../store";
// import {connect} from "react-redux";
//
//
// @connect((store) => {
//   return {login_res:store.login.login_response};
// })
export default class TopPanel extends React.Component {
    constructor(props){
		super(props);
		this.state = {loginFlag: true}
	}
	logout(){

		  this.setState({
             loginFlag: false
         });
         //sessionObject.clearSession();
         cookieObj.clearCookies();
         //location.reload();
	}
	render(){
		if(!this.state.loginFlag){
			return(<Redirect to="/login" />);
		}else{
		console.log("top panel & user name"+getUserDetailsOrRestart.get().userName);
			return(
		            <div>
								{/* // Header Menu*/}

								<nav className="navbar navbar-default navbar-fixed-top box-shadow" role="navigation">
								<LoadingBar style={{ backgroundColor: '#148071', height: '3px' }} />
									{/*/ Brand and toggle get grouped for better mobile display -->*/}
									<div className="navbar-header">
										<div className="brand-wrapper">
											{/* Hamburger */}
											<button type="button" className="navbar-toggle">
												<span className="sr-only">Toggle navigation</span>
												<span className="icon-bar"></span>
												<span className="icon-bar"></span>
												<span className="icon-bar"></span>
											</button>

											{/* Brand */}
											<div className="brand-name-wrapper">
												<a className="navbar-brand" href="/"></a>
											</div>
										</div>
									</div>
									<div className="dropdown ma-user-nav">
										<a className="dropdown-toggle" href="#" data-toggle="dropdown">
											<i className="avatar-img img-circle">{getUserDetailsOrRestart.get().userName.substr(0,1).toUpperCase()}</i>
											<img src="" alt="M" className="avatar-img img-circle hide"/>&nbsp;
											<span className="user-name">{getUserDetailsOrRestart.get().userName}</span>
											<span className="caret"></span>
										</a>
										<ul className="dropdown-menu dropdown-menu-right">
											<li>
												<Link to="/user-profile"><i class="zmdi zmdi-account-o zmdi-hc-lg" aria-hidden="true"></i>&nbsp;&nbsp;Profile</Link>
											</li>
											<li><a href="userManual/UserManual.html" target="_blank"><i class="zmdi zmdi-help-outline zmdi-hc-lg" aria-hidden="true"></i>&nbsp;&nbsp;How to use ?</a></li>
											<li>
												<a href="javascript:;" className="logout" onClick={this.logout.bind(this)}><i class="zmdi zmdi-sign-in zmdi-hc-lg" aria-hidden="true"></i>&nbsp;&nbsp;Logout</a>
											</li>
										</ul>
									</div>
									<div className="clearfix"></div>
								</nav>
								</div>

		 );
		}
  }

}
