import React from "react";

export default class DescriptionPanel extends React.Component {

	render(){
		console.log("decp")
		return(
		            <div>
								<div className="side-body">

									{/*/ Page Title and Breadcrumbs -->*/}
									<div className="page-head">
										<ol className="breadcrumb">
											<li>
												<a href="#">Story</a>
											</li>
											<li className="active">Sales Performance Report</li>
										</ol>
										<h2>Sales Performance Report</h2>
									</div>
									{/*/ /.Page Title and Breadcrumbs -->

																	// Page Content Area -->*/}
									<div className="main-content">

										Content Area
									</div>
									{/* // /.Page Content Area -->*/}

								</div>
								</div>

		 );
	}
}
