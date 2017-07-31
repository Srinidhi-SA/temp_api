import React from "react";

export default class TopPanel extends React.Component {

	render(){
		console.log("top")
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
											<img src="assets/images/avatar.jpg" alt="M" className="avatar-img img-circle hide"/>
											<span className="user-name">Marlabs BI</span>
											<span className="caret"></span>
										</a>
										<ul className="dropdown-menu dropdown-menu-right">
											<li>
												<a href="#">Profile</a>
											</li>
											<li>
												<a href="#">Logout</a>
											</li>
										</ul>
									</div>
									<div className="clearfix"></div>
								</nav>
								</div>

		 );
	}
}
