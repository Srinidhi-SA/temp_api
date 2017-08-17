import React from "react";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router";
import store from "../../store";
import {Modal,Button,Tab,Row,Col,Nav,NavItem,Popover,OverlayTrigger} from "react-bootstrap";
import {C3Chart} from "../c3Chart";
import ReactDOM from 'react-dom';
import $ from "jquery";

import {updateSelectedVariables} from "../../actions/dataActions";

@connect((store) => {
	return {login_response: store.login.login_response, dataPreview: store.datasets.dataPreview,
		selectedVariablesCount:store.datasets.selectedVariablesCount,
		selectedMeasures:store.datasets.selectedMeasures,
		selectedDimensions:store.datasets.selectedDimensions,
		selectedVariablesCount:store.datasets.selectedVariablesCount};
})

export class DataVariableSelection extends React.Component {
	constructor(props) {
		super(props);
		this.handleCheckboxEvents = this.handleCheckboxEvents.bind(this);
	}
	handleCheckboxEvents(e){
		this.props.dispatch(updateSelectedVariables(e))
	}
	render() {

		console.log("data variableSelection is called##########3");
		let dataPrev = store.getState().datasets.dataPreview;
		if(dataPrev){
			console.log("data variable selection");
			console.log(dataPrev);
			 const metaData = dataPrev.meta_data.columnData;
			    var measures =[], dimensions =[],datetime =[];
			    metaData.map((metaItem,metaIndex)=>{
			      switch(metaItem.columnType){
			        case "measure":
			         //m[metaItem.slug] = metaItem.name;
			         measures.push(metaItem.name);
			         //m={};
			         break;
			        case "dimension":
			         dimensions.push(metaItem.name);
			        break;
			        case "datetime":
			          datetime.push(metaItem.name);
			        break;
			      }

			    });
			    if(measures.length>0){
			    	  var measureTemplate = measures.map((mItem,mIndex)=>{
			    	      const mId = "chk_mea" + mIndex;
			    	      return(
			    	        <li key={mIndex}><div className="ma-checkbox inline"><input id={mId} type="checkbox" className="measure" onChange={this.handleCheckboxEvents} value={mItem}/><label htmlFor={mId} className="radioLabels">{mItem}</label></div> </li>
			    	      );
			    	  });
			    	}else{
			    	  var measureTemplate =  <label>No measure variable present</label>
			    	}
			    if(dimensions.length>0){
			    	  var dimensionTemplate = dimensions.map((dItem,dIndex)=>{
			    	      const dId = "chk_dim" + dIndex;
			    	    return(
			    	     <li key={dIndex}><div className="ma-checkbox inline"><input id={dId} type="checkbox" className="dimension" onChange={this.handleCheckboxEvents} value={dItem}/><label htmlFor={dId}>{dItem}</label></div> </li>
			    	   );
			    	  });
			    	}else{
			    	  var dimensionTemplate =  <label>No dimension variable present</label>
			    	}

			    	if(datetime.length>0){
			    	  var datetimeTemplate = datetime.map((dtItem,dtIndex)=>{
			    	    const dtId = "rad_dt" + dtIndex;
			    	  return(
			    	   <li key={dtIndex}><div className="ma-radio inline"><input type="radio"  className="timeDimension" onChange={this.handleCheckboxEvents} name="date_type" id={dtId} value={dtItem}/><label htmlFor={dtId}>{dtItem}</label></div></li>
			    	 );
			    	  });
			    	}else{
			    	  var datetimeTemplate = <label>No dates variable present</label>
			    	}
			    	const popoverLeft = (
							  <Popover id="popover-positioned-top" title="Variables List">
							 Testing
							  </Popover>
							);
			return(
					<div>


			         <div className="row">
			          <div className="col-lg-4">
			              <label>Including the follwing variables:</label>
			          </div>{/*<!-- /.col-lg-4 -->*/}
			          </div>
			  {/*<!-------------------------------------------------------------------------------->*/}
			          <div className="row">
			          <div className="col-lg-4">
			            <div className="panel panel-primary-p1 cst-panel-shadow">
			            <div className="panel-heading"><i className="pe-7s-graph1"></i> Measures</div>
			            <div className="panel-body">
			            {/*  <!-- Row for select all-->*/}
			              <div className="row">
			                <div className="col-md-4">
			                  <div className="ma-checkbox inline">
			                  <input id="mea" type="checkbox" className="measureAll" />
			                  <label htmlFor="mea">Select All</label>
			                  </div>
			                </div>
			                <div className="col-md-8">
			                  <div className="input-group pull-right">
			                  <input type="text" name="search_signals" title="Search Signals" id="search_signals" className="form-control" placeholder="Search signals..." />
			                  <span className="input-group-addon"><i className="fa fa-search fa-lg"></i></span>
			                  <span className="input-group-btn">
			                  <button type="button" data-toggle="dropdown" title="Sorting" className="btn btn-default dropdown-toggle" aria-expanded="false"><i className="fa fa-sort-alpha-asc fa-lg"></i> <span className="caret"></span></button>
			                  <ul role="menu" className="dropdown-menu dropdown-menu-right">
			                  <li><a href="#">Name Ascending</a></li>
			                  <li><a href="#">Name Descending</a></li>
			                  <li><a href="#">Date Ascending</a></li>
			                  <li><a href="#">Date Descending</a></li>
			                  </ul>
			                  </span>
			                  </div>
			                </div>
			              </div>
			            {/*  <!-- End -->*/}
			              <hr />
			            {/*  <!-- Row for list of variables-->*/}
			              <div className="row">
			                <div className="col-md-12 cst-scroll-panel">
			                  <ul className="list-unstyled">
			                      {measureTemplate}
			                  </ul>
			                </div>
			              </div>
			            {/*  <!-- End Row for list of variables-->*/}
			            </div>
			            </div>

			          </div>{/*<!-- /.col-lg-4 -->*/}
			          <div className="col-lg-4">
			              <div className="panel panel-primary-p2 cst-panel-shadow">
			              <div className="panel-heading"><i className="pe-7s-graph1"></i> Dimensions</div>
			                <div className="panel-body">
			                  {/*  <!-- Row for select all-->*/}
			                    <div className="row">
			                      <div className="col-md-4">
			                        <div className="ma-checkbox inline">
			                        <input id="dim" type="checkbox" className="dimensionAll"/>
			                        <label htmlFor="dim">Select All</label>
			                        </div>
			                      </div>
			                    <div className="col-md-8">
			                      <div className="input-group pull-right">
			                      <input type="text" name="search_signals" title="Search Signals" id="search_signals" className="form-control" placeholder="Search signals..." />
			                      <span className="input-group-addon"><i className="fa fa-search fa-lg"></i></span>
			                      <span className="input-group-btn">
			                      <button type="button" data-toggle="dropdown" title="Sorting" className="btn btn-default dropdown-toggle" aria-expanded="false"><i className="fa fa-sort-alpha-asc fa-lg"></i> <span className="caret"></span></button>
			                      <ul role="menu" className="dropdown-menu dropdown-menu-right">
			                      <li><a href="#">Name Ascending</a></li>
			                      <li><a href="#">Name Descending</a></li>
			                      <li><a href="#">Date Ascending</a></li>
			                      <li><a href="#">Date Descending</a></li>
			                      </ul>
			                      </span>
			                      </div>
			                    </div>
			                    </div>
			                  {/*  <!-- End -->*/}
			                    <hr />
			                  {/*  <!-- Row for list of variables-->*/}
			                    <div className="row">
			                    <div className="col-md-12 cst-scroll-panel">
			                      <ul className="list-unstyled">
			                           {dimensionTemplate}
			                      </ul>
			                    </div>
			                    </div>
			                  {/*  <!-- End Row for list of variables-->*/}


			                </div>
			              </div>


			          </div>{/*<!-- /.col-lg-4 -->*/}
			          <div className="col-lg-4">
			              <div className="panel panel-primary-p3 cst-panel-shadow">
			            <div className="panel-heading"><i className="pe-7s-date"></i> Dates</div>
			            <div className="panel-body">

			            {/*  <!-- Row for options all-->*/}
			                    <div className="row">
			                      <div className="col-md-4">

			                      </div>
			                    <div className="col-md-8">
			                      <div className="input-group pull-right">
			                      <input type="text" name="search_signals" title="Search Signals" id="search_signals" className="form-control" placeholder="Search signals..."/>
			                      <span className="input-group-addon"><i className="fa fa-search fa-lg"></i></span>
			                      <span className="input-group-btn">
			                      <button type="button" data-toggle="dropdown" title="Sorting" className="btn btn-default dropdown-toggle" aria-expanded="false"><i className="fa fa-sort-alpha-asc fa-lg"></i> <span className="caret"></span></button>
			                      <ul role="menu" className="dropdown-menu dropdown-menu-right">
			                      <li><a href="#">Name Ascending</a></li>
			                      <li><a href="#">Name Descending</a></li>
			                      <li><a href="#">Date Ascending</a></li>
			                      <li><a href="#">Date Descending</a></li>
			                      </ul>
			                      </span>
			                      </div>
			                    </div>
			                    </div>
			                    {/*<!-- End Row for options all -->*/}
			                    <hr />
			                      {/*<!-- Row for list of variables-->*/}
			                    <div className="row">
			                    <div className="col-md-12 cst-scroll-panel">

			                      <ul className="list-unstyled">
			                                {datetimeTemplate}
			                      </ul>
			                    </div>
			                    </div>
			                      {/*<!-- End Row for list of variables-->*/}

			            </div>
			            </div>
			          </div>{/*<!-- /.col-lg-4 -->*/}
			          </div>  {/*<!-- /.row -->*/}
			{/*<!-------------------------------------------------------------------------------->*/}
			 <div className="row">
	            <div className="col-md-4 col-md-offset-5">
	                <h4>{store.getState().datasets.selectedVariablesCount} Variable selected<OverlayTrigger trigger="click" placement="left"><a><i className="pe-7s-more pe-2x pe-va"></i></a></OverlayTrigger></h4>
	            </div>
	          </div>
			     </div>



			);
		}else{
			return (
					<div>No data Available</div>
			);
		}
	}
}
