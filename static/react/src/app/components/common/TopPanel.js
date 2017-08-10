import React from "react";
import {Redirect} from 'react-router';
import ReactDOM from 'react-dom';
import {sessionObject} from '../../helpers/manageSessionStorage';
// import $ from 'jquery';

// import store from "../../store";
// import {connect} from "react-redux";
//
//
// @connect((store) => {
//   return {login_res:store.login.login_response};
// })
export default class TopPanel extends React.Component {

	logout(){
		sessionObject.clearSession();
	}
	render(){
		console.log("top panel & user name"+sessionStorage.username);
			return(
		            <div>
								{/* // Header Menu*/}
								<nav className="navbar navbar-default navbar-fixed-top" role="navigation">
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
												<a className="navbar-brand" href="#"></a>
											</div>
										</div>
									</div>
									<div className="dropdown ma-user-nav">
										<a className="dropdown-toggle" href="#" data-toggle="dropdown">
											<i className="avatar-img img-circle">M</i>
											<img src="" alt="M" className="avatar-img img-circle hide"/>
											<span className="user-name"> {sessionStorage.username}</span>
											<span className="caret"></span>
										</a>
										<ul className="dropdown-menu dropdown-menu-right">
											<li>
												<a href="javascript:;"><i class="fa fa-user" aria-hidden="true"></i> Profile</a>
											</li>
											<li>
												<a href="javascript:;" className="logout" onClick={this.logout}><i class="fa fa-sign-out" aria-hidden="true"></i> Logout</a>
											</li>
										</ul>
									</div>
									<div className="clearfix"></div>
								</nav>
								</div>

		 );
  }
}
