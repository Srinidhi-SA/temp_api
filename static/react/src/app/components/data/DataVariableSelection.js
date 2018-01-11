import React from "react";
import { Scrollbars } from 'react-custom-scrollbars';
import { MainHeader } from "../common/MainHeader";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router";
import { Modal, Button, Tab, Row, Col, Nav, NavItem, Popover, OverlayTrigger } from "react-bootstrap";
import ReactDOM from 'react-dom';

import store from "../../store";
import { C3Chart } from "../c3Chart";
import $ from "jquery";

import {updateSelectedVariables, resetSelectedVariables, setSelectedVariables,updateDatasetVariables,handleDVSearch,handelSort,handleSelectAll,checkColumnIsIgnored } from "../../actions/dataActions";

@connect(( store ) => {
    return {
        login_response: store.login.login_response, dataPreview: store.datasets.dataPreview,
        selectedVariablesCount: store.datasets.selectedVariablesCount,
        selectedMeasures: store.datasets.selectedMeasures,
        selectedDimensions: store.datasets.selectedDimensions,
        selectedTimeDimensions: store.datasets.selectedTimeDimensions,
        dataSetMeasures:store.datasets.dataSetMeasures,
        dataSetDimensions:store.datasets.dataSetDimensions,
        dataSetTimeDimensions:store.datasets.dataSetTimeDimensions,
        measureAllChecked:store.datasets.measureAllChecked,
        measureChecked:store.datasets.measureChecked,
        dimensionAllChecked:store.datasets.dimensionAllChecked,
        dimensionChecked:store.datasets.dimensionChecked,
        dateTimeChecked:store.datasets.dateTimeChecked,
        dataSetAnalysisList:store.datasets.dataSetAnalysisList,
    };
} )

export class DataVariableSelection extends React.Component {
    constructor( props ) {
        super( props );
        this.firstLoop = true;
        //this.props.dispatch(resetSelectedVariables());
        this.handleCheckboxEvents = this.handleCheckboxEvents.bind( this );
        this.setVariables = this.setVariables.bind( this );
        this.measures = [];
        this.dimensions = [];
        this.datetime = [];
        this.measureChkBoxList = [];
        this.dimensionChkBoxList = [];
        this.dimensionDateTime = [];
        this.dateTimeChkBoxList = [];
        this.selectedTimeDimension = "";
        this.possibleAnalysisList = {};
    }
    handleCheckboxEvents( e ) {
        this.props.dispatch( updateSelectedVariables( e ) )
    }
    setVariables( dimensions, measures, timeDimension) {
        //	this.props.dispatch(resetSelectedVariables());
        this.props.dispatch( setSelectedVariables( dimensions, measures, timeDimension ) )
    }

    componentDidMount() {
    	window.scrollTo(0, 0); 
        this.props.dispatch( resetSelectedVariables() );
        this.setVariables( this.dimensions, this.measures, this.selectedTimeDimension );
        this.props.dispatch(updateDatasetVariables(this.measures,this.dimensions,this.datetime,this.measureChkBoxList,this.dimensionChkBoxList,this.dateTimeChkBoxList,this.possibleAnalysisList));
        
    }
    handleDVSearch(evt){
    this.props.dispatch(handleDVSearch(evt))
    }
    handelSort(variableType,sortOrder){
    	this.props.dispatch(handelSort(variableType,sortOrder))
    }
    handleSelectAll(evt){
    	this.props.dispatch(handleSelectAll(evt))
    }
    render() {

        console.log( "data variableSelection is called##########3" );

        let dataPrev = store.getState().datasets.dataPreview;
       
        var that = this;
        const popoverLeft = (
        		  <Popover id="popover-trigger-hover-focus">
        		<p>mAdvisor has identified this as date suggestion.This could be used for trend analysis. </p>
        		  </Popover>
        		);
        
        let timeSuggestionToolTip = (<div className="col-md-2"><OverlayTrigger trigger={['hover', 'focus']}  rootClose placement="top" overlay={popoverLeft}>
        <a className="pover cursor">
        <i className="pe-7s-info pe-2x"></i>
      </a>
    </OverlayTrigger></div>)
        
        if ( dataPrev ) {
            console.log( "data variable selection" );
            console.log( dataPrev );
            this.possibleAnalysisList = dataPrev.meta_data.advanced_settings;
            const metaData = dataPrev.meta_data.columnData;
            // var measures =[], dimensions =[],datetime =[];
            metaData.map(( metaItem, metaIndex ) => {
                if ( this.firstLoop ) {
                   
                    switch ( metaItem.columnType ) {
                        case "measure":
                           if(metaItem.consider){
                        	   this.measures.push( metaItem.name );
                               this.measureChkBoxList.push(true);  
                           }
                            break;
                        case "dimension":
                        	if(metaItem.consider && !metaItem.dateSuggestionFlag){
                        		this.dimensions.push( metaItem.name );
                        		this.dimensionChkBoxList.push(true)
                        	}else if(metaItem.dateSuggestionFlag){
                        		 this.dimensionDateTime.push(metaItem.name)
                        	}
                            break;
                        case "datetime":
                            this.datetime.push( metaItem.name );
                            break;
                    }
                    this.selectedTimeDimension = this.datetime[0];
                }


            } );

            this.datetime = this.datetime.concat(this.dimensionDateTime);
            if ( this.firstLoop ) {
            for(var i=0;i<this.datetime.length;i++){
            	if(i == 0 && $.inArray( this.datetime[i], that.dimensionDateTime)){
            		this.dateTimeChkBoxList.push(true)
            	}else{
            		this.dateTimeChkBoxList.push(false)
            	}
            }
            this.props.dispatch( resetSelectedVariables() );
            this.setVariables( this.dimensions, this.measures, this.selectedTimeDimension);
            this.props.dispatch(updateDatasetVariables(this.measures,this.dimensions,this.datetime,this.measureChkBoxList,this.dimensionChkBoxList,this.dateTimeChkBoxList,this.possibleAnalysisList));
              
            }

           
            this.firstLoop = false;
            
            if ( store.getState().datasets.dataSetMeasures.length > 0 ) {
                var measureTemplate = store.getState().datasets.dataSetMeasures.map(( mItem, mIndex ) => {
                    const mId = "chk_mea" + mIndex;
                    return (
                        <li key={mIndex}><div className="ma-checkbox inline"><input id={mId} name={mIndex} type="checkbox" className="measure" onChange={this.handleCheckboxEvents} value={mItem} checked={store.getState().datasets.measureChecked[mIndex]}   /><label htmlFor={mId} className="radioLabels">{mItem}</label></div> </li>
                    );
                } );
            } else {
                var measureTemplate = <label>No measure variable present</label>
            }
            if ( store.getState().datasets.dataSetDimensions.length > 0 ) {
                var dimensionTemplate = store.getState().datasets.dataSetDimensions.map(( dItem, dIndex ) => {
                    const dId = "chk_dim" + dIndex;
                    
                    return (
                        <li key={dIndex}><div className="ma-checkbox inline"><input id={dId} name={dIndex} type="checkbox" className="dimension" onChange={this.handleCheckboxEvents} value={dItem} checked={store.getState().datasets.dimensionChecked[dIndex]} /><label htmlFor={dId}>{dItem}</label></div> </li>
                    );
                } );
            } else {
                var dimensionTemplate = <label>No dimension variable present</label>
            }

            if ( store.getState().datasets.dataSetTimeDimensions.length > 0 ) {
                var datetimeTemplate = store.getState().datasets.dataSetTimeDimensions.map(( dtItem, dtIndex ) => {
                    const dtId = "rad_dt" + dtIndex;
              
                    	if($.inArray( dtItem, that.dimensionDateTime) == -1){
                        	return (
                        			<li key={dtIndex}><div className="ma-radio inline"><input type="radio" className="timeDimension" onClick={this.handleCheckboxEvents}  name="date_type" id={dtId} value={dtItem} checked={store.getState().datasets.dateTimeChecked[dtIndex]} /><label htmlFor={dtId}>{dtItem}</label></div></li>
                        	);
                        }else{
                        	return (
                        			<li key={dtIndex}><div className="ma-radio inline col-md-10"><input type="radio" className="timeDimension" onClick={this.handleCheckboxEvents}  name="date_type" id={dtId} value={dtItem} checked={store.getState().datasets.dateTimeChecked[dtIndex]} /><label htmlFor={dtId}>{dtItem}</label></div>{timeSuggestionToolTip}</li>
                        	);	
                        }
             
                    
                   
                } );
            } else {
                var datetimeTemplate = <label>No date dimensions to display</label>
            }

           
            return (
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
                                <div className="panel-heading"><i className="mAd_icons ic_inflnce"></i> Measures</div>
                                <div className="panel-body">
                                    {/*  <!-- Row for select all-->*/}
                                    <div className="row">
                                        <div className="col-md-12 col-sm-12 xs-pr-0">
                                            
											 <div class="btn-toolbar pull-right">
                                             {/*   <input type="text" name="measure" title="Search Measures" id="measureSearch"  onChange={this.handleDVSearch.bind(this)} className="form-control" placeholder="Search measures..." />*/}
											 
											<div class="input-group">
											<div className="search-wrapper">
											<form>
											<input type="text" name="measure" onChange={this.handleDVSearch.bind(this)} title="Search Measures" id="measureSearch" className="form-control search-box" placeholder="Search measures..." required />
											<span className="zmdi zmdi-search form-control-feedback"></span>
											<button className="close-icon" type="reset"></button>
											</form>
											</div>
											</div>
											<div class="btn-group">
											<button type="button" data-toggle="dropdown" title="Sorting" className="btn btn-default dropdown-toggle" aria-expanded="false"><i class="zmdi zmdi-hc-lg zmdi-sort-asc"></i></button>
											<ul role="menu" className="dropdown-menu dropdown-menu-right">
											<li onClick={this.handelSort.bind(this,"measure","ASC")} className="cursor"><a><i class="zmdi zmdi-sort-amount-asc"></i> Ascending</a></li>
											<li onClick={this.handelSort.bind(this,"measure","DESC")} className="cursor"><a><i class="zmdi zmdi-sort-amount-desc"></i> Descending</a></li>
											</ul>
											</div>
												
                                            </div>
											
											<div className="ma-checkbox inline">
                                                <input id="measure" type="checkbox" className="measureAll" onChange={this.handleSelectAll.bind(this)} checked={store.getState().datasets.measureAllChecked}/>
                                                <label htmlFor="measure">Select All</label>
                                            </div>
											
											
                                        </div>
                                      
                                    </div>
									<div className="xs-pb-10"></div>
                                    {/*  <!-- End -->*/}
                                    {/*  <hr /> */}
                                    {/*  <!-- Row for list of variables-->*/}
                                    <div className="row">
                                        <div className="col-md-12 cst-scroll-panel">
                                            <Scrollbars>
                                                <ul className="list-unstyled">
                                                    {measureTemplate}
                                                </ul>
                                            </Scrollbars>
                                        </div>
                                    </div>
                                    {/*  <!-- End Row for list of variables-->*/}
                                </div>
                            </div>

                        </div>{/*<!-- /.col-lg-4 -->*/}
                        <div className="col-lg-4">
                            <div className="panel panel-primary-p2 cst-panel-shadow">


                                <div className="panel-heading"><i className="mAd_icons ic_perf "></i> Dimensions</div>

                                <div className="panel-body">
                                    {/*  <!-- Row for select all-->*/}
                                    <div className="row">
                                        <div className="col-md-12 col-sm-12 xs-pr-0">
                                            
											<div class="btn-toolbar pull-right">
                                                {/* <input type="text" name="dimension" title="Search Dimension" id="dimensionSearch" onChange={this.handleDVSearch.bind(this)}  className="form-control" placeholder="Search dimension..." />
                                                <span className="input-group-addon"><i className="fa fa-search fa-lg"></i></span>*/}
                                                
												<div class="input-group">			
												<div className="search-wrapper">
												<form>
												<input type="text" name="dimension" onChange={this.handleDVSearch.bind(this)} title="Search Dimension" id="dimensionSearch" className="form-control search-box" placeholder="Search dimension..." required />
												<span className="zmdi zmdi-search form-control-feedback"></span>
												<button className="close-icon" type="reset"></button>
												</form>
												</div>
												</div>
												 <div class="btn-group">
                                                    <button type="button" data-toggle="dropdown" title="Sorting" className="btn btn-default dropdown-toggle" aria-expanded="false"><i class="zmdi zmdi-hc-lg zmdi-sort-asc"></i></button>
                                                    <ul role="menu" className="dropdown-menu dropdown-menu-right">
                                                        <li onClick={this.handelSort.bind(this,"dimension","ASC")} className="cursor"><a><i class="zmdi zmdi-sort-amount-asc"></i> Ascending</a></li>
                                                        <li onClick={this.handelSort.bind(this,"dimension","DESC")} className="cursor"><a><i class="zmdi zmdi-sort-amount-desc"></i> Descending</a></li>
                                                    </ul>
                                                </div>												
                                            </div>
											
											<div className="ma-checkbox inline">
                                                <input id="dimension" type="checkbox" className="dimensionAll" onChange={this.handleSelectAll.bind(this)} checked={store.getState().datasets.dimensionAllChecked}/>
                                                <label htmlFor="dimension">Select All</label>
                                            </div>
                                        </div>
                                      
                                    </div>
									<div className="xs-pb-10"></div>
                                    {/*  <!-- End -->*/}
                                    {/* <hr /> */}
                                    {/*  <!-- Row for list of variables-->*/}
                                    <div className="row">
                                        <div className="col-md-12 cst-scroll-panel">
                                            <Scrollbars>
                                                <ul className="list-unstyled">
                                                    {dimensionTemplate}
                                                </ul>
                                            </Scrollbars>
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
                                         
                                        <div className="col-md-12 col-sm-12 xs-pr-0">
										
                                            <div class="btn-toolbar pull-right">
											
                                              {/*  <input type="text" name="datetime" title="Search Time Dimensions" id="datetimeSearch" className="form-control" onChange={this.handleDVSearch.bind(this)} placeholder="Search time dimensions..." />
                                                 <span className="input-group-addon"><i className="fa fa-search fa-lg"></i></span>*/}
                                                
												<div class="input-group">			
												<div className="search-wrapper">
												<form>
												<input type="text" name="datetime" onChange={this.handleDVSearch.bind(this)} title="Search Time Dimensions" id="datetimeSearch" className="form-control search-box" placeholder="Search time dimensions..." required />
												<span className="zmdi zmdi-search form-control-feedback"></span>
												<button className="close-icon" type="reset"></button>
												</form>
												</div>
												</div>
												
												
												<div class="btn-group">
                                                    <button type="button" data-toggle="dropdown" title="Sorting" className="btn btn-default dropdown-toggle" aria-expanded="false"><i class="zmdi zmdi-hc-lg zmdi-sort-asc"></i></button>
                                                    <ul role="menu" className="dropdown-menu dropdown-menu-right">
                                                        <li onClick={this.handelSort.bind(this,"datetime","ASC")} className="cursor"><a><i class="zmdi zmdi-sort-amount-asc"></i> Ascending</a></li>
                                                        <li onClick={this.handelSort.bind(this,"datetime","DESC")} className="cursor"><a><i class="zmdi zmdi-sort-amount-desc"></i> Descending</a></li>
                                                       
                                                    </ul>
                                                </div>
												
                                            </div>
											
                                        </div>
                                    </div>
									<div className="xs-pb-10"></div>
                                    {/*<!-- End Row for options all -->*/}
                                    {/* <hr /> */}
                                    {/*<!-- Row for list of variables-->*/}
                                    <div className="row">
                                        <div className="col-md-12 cst-scroll-panel">
                                            <Scrollbars>
                                                <ul className="list-unstyled">
                                                    {datetimeTemplate}
                                                </ul>
                                            </Scrollbars>
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

                            <h4>{store.getState().datasets.selectedVariablesCount} Variables selected </h4>
                            {/*<OverlayTrigger trigger="click" placement="left" overlay={popoverLeft}><a><i className="pe-7s-more pe-2x pe-va"></i></a></OverlayTrigger>*/}

                        </div>
                    </div>
                </div>



            );
        } else {
            return (
                <div>No data Available</div>
            );
        }
    }
}
