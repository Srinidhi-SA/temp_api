import React from "react";
import { Scrollbars } from 'react-custom-scrollbars';
import { MainHeader } from "../common/MainHeader";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router";
import { Modal, Button, Tab, Row, Col, Nav, NavItem, Popover, OverlayTrigger } from "react-bootstrap";

import store from "../../store";
import { C3Chart } from "../c3Chart";
import $ from "jquery";

import {updateSelectedVariables, resetSelectedVariables, setSelectedVariables,updateDatasetVariables,handleDVSearch,handelSort,handleSelectAll,checkColumnIsIgnored,deselectAllVariablesDataPrev,makeAllVariablesTrueOrFalse,DisableSelectAllCheckbox,updateVariableSelectionArray} from "../../actions/dataActions";
import {resetSelectedTargetVariable} from "../../actions/signalActions";

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
        isUpdate:store.datasets.isUpdate,
        modelSummary:store.apps.modelSummary,
        createScoreShowVariables:store.datasets.createScoreShowVariables,
    };
} )

export class DataVariableSelection extends React.Component {
    constructor( props ) {
        super( props );
        this.firstLoop = true;
        //this.props.dispatch(resetSelectedVariables());
        this.handleCheckboxEvents = this.handleCheckboxEvents.bind( this );
        //this.setVariables = this.setVariables.bind( this );
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
    componentDidMount() {
    	window.scrollTo(0, 0);
        if(this.props.match.path.includes("createScore") && store.getState().apps.currentAppDetails != null && store.getState().apps.currentAppDetails.app_type == "REGRESSION"){
            deselectAllVariablesDataPrev();
            DisableSelectAllCheckbox();
            this.props.dispatch( resetSelectedVariables(false) );
        }
        else
        this.props.dispatch( resetSelectedVariables(true) );
        this.props.dispatch(resetSelectedTargetVariable());
       // this.setVariables( this.dimensions, this.measures, this.selectedTimeDimension );
        this.props.dispatch(updateDatasetVariables(this.measures,this.dimensions,this.datetime,this.possibleAnalysisList,true));
    }

    handleDVSearch(evt){
    evt.preventDefault();
    if(evt.target.name == "measure" && evt.target.value == "")
    $("#measureSearch").val("");
    if(evt.target.name == "dimension" && evt.target.value == "")
    $("#dimensionSearch").val("");
    if(evt.target.name == "datetime" && evt.target.value == "")
    $("#datetimeSearch").val("");
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
        var variableSelectionMsg = <label>Including the follwing variables:</label>;

        let dataPrev = store.getState().datasets.dataPreview;
        let modelSummary = this.props.modelSummary;
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
            if(this.props.match.path.includes("/createScore") && !$.isEmptyObject(modelSummary))
            this.props.dispatch(updateVariableSelectionArray(modelSummary));
            this.possibleAnalysisList = dataPrev.meta_data.uiMetaData.advanced_settings;
            const metaData = dataPrev.meta_data.uiMetaData.varibaleSelectionArray;
            this.measures = [];
            this.dimensions = [];
            this.datetime = [];
            this.dimensionDateTime =[];
            metaData.map(( metaItem, metaIndex ) => {

                if ( (this.props.isUpdate && this.props.createScoreShowVariables && this.props.match.path.includes("/createScore")) || (this.props.isUpdate && !this.props.match.path.includes("/createScore"))) {

                    switch ( metaItem.columnType ) {
                        case "measure":
                           if(metaItem.setVarAs == null){
                               this.measures.push( metaItem);
                               //this.measureChkBoxList.push(true);
                           }else if(metaItem.setVarAs != null){
                               this.dimensions.push(metaItem);
                           }
                            break;
                        case "dimension":
                        	if(!metaItem.dateSuggestionFlag){
                                this.dimensions.push( metaItem);
                        		//this.dimensionChkBoxList.push(true)
                        	}else if(metaItem.dateSuggestionFlag){
                        		 this.dimensionDateTime.push(metaItem)
                        	}
                            break;
                        case "datetime":
                            this.datetime.push( metaItem);
                            break;
                    }
                    //this.selectedTimeDimension = this.datetime[0];
              }


            } );

            this.datetime = this.datetime.concat(this.dimensionDateTime);

            if ( (this.props.isUpdate && this.props.createScoreShowVariables && this.props.match.path.includes("/createScore")) || (this.props.isUpdate && !this.props.match.path.includes("/createScore"))) {
            if(this.props.match.path.includes("createScore") && store.getState().apps.currentAppDetails != null && store.getState().apps.currentAppDetails.app_type == "REGRESSION"){
                this.props.dispatch(resetSelectedVariables(false));
                deselectAllVariablesDataPrev();
                DisableSelectAllCheckbox();
            }
            else
            this.props.dispatch( resetSelectedVariables(true));
            this.props.dispatch(updateDatasetVariables(this.measures,this.dimensions,this.datetime,this.possibleAnalysisList,false)); 
        }

            var varCls = "";

            if ( store.getState().datasets.dataSetMeasures.length > 0 ) {
                if(store.getState().datasets.dataSetMeasures.length == 1 && store.getState().datasets.dataSetMeasures[0].targetColumn){
                    $(".measureAll").prop("disabled",true);
                    var measureTemplate = <label>No measure variable present</label>
                }
                else{
                    var measureTemplate = store.getState().datasets.dataSetMeasures.map(( mItem, mIndex ) => {
                    if(mItem.targetColumn || mItem.uidCol)varCls="hidden";
                    else varCls = "";
                        return (
                            <li className={varCls} key={mItem.slug}><div className="ma-checkbox inline"><input id={mItem.slug} name={mItem.setVarAs} type="checkbox" className="measure" onChange={this.handleCheckboxEvents} value={mItem.name} checked={mItem.selected} /><label htmlFor={mItem.slug} className="radioLabels"><span>{mItem.name}</span></label></div> </li>
                        );
                    } );
                    $(".measureAll").prop("disabled",false);
                }
            } else {
                $(".measureAll").prop("disabled",true);
                var measureTemplate = <label>No measure variable present</label>
            }
            if ( store.getState().datasets.dataSetDimensions.length > 0 ) {
                if(store.getState().datasets.dataSetDimensions.length == 1 && store.getState().datasets.dataSetDimensions[0].targetColumn){
                    $(".dimensionAll").prop("disabled",true);
                    var dimensionTemplate = <label>No dimension variable present</label>
                }
                else{
                    var dimensionTemplate = store.getState().datasets.dataSetDimensions.map(( dItem, dIndex ) => {

                        if(dItem.targetColumn ||  dItem.uidCol)varCls="hidden";
                        else varCls = "";
                        return (
                            <li className={varCls} key={dItem.slug}><div className="ma-checkbox inline"><input id={dItem.slug} name={dItem.setVarAs} type="checkbox" className="dimension" onChange={this.handleCheckboxEvents} value={dItem.name} checked={dItem.selected} /><label htmlFor={dItem.slug}> <span>{dItem.name}</span></label></div> </li>
                        );
                    } );
                    $(".dimensionAll").prop("disabled",false);
                }
            } else {
                $(".dimensionAll").prop("disabled",true);
                var dimensionTemplate = <label>No dimension variable present</label>
            }

            if ( store.getState().datasets.dataSetTimeDimensions.length > 0 ) {
                var datetimeTemplate = store.getState().datasets.dataSetTimeDimensions.map(( dtItem, dtIndex ) => {
                    if(dtItem.uidCol)varCls="hidden";
                    else varCls = "";

                    	if(dtItem.columnType != "dimension"){
                        	return (
                        			<li className={varCls} key={dtItem.slug}><div className="ma-radio inline"><input type="radio" className="timeDimension" onClick={this.handleCheckboxEvents}  name="date_type" id={dtItem.slug} value={dtItem.name} checked={dtItem.selected} /><label htmlFor={dtItem.slug}>{dtItem.name}</label></div></li>
                        	);
                        }else{
                        	return (

                        			<li className={varCls} key={dtItem.slug}><div className="ma-radio inline col-md-10"><input type="radio" className="timeDimension" onClick={this.handleCheckboxEvents}  name="date_type" id={dtItem.slug} value={dtItem.name} checked={dtItem.selected} /><label htmlFor={dtItem.slug}>{dtItem.name}</label></div>{timeSuggestionToolTip}</li>
                        	);
                        }



                } );
            } else {

                var datetimeTemplate = <label>No date dimensions to display</label>
            }
            if(this.props.match.path.includes("/createScore") && store.getState().apps.currentAppDetails != null && store.getState().apps.currentAppDetails.app_type == "REGRESSION"){
                let measureArray = $.grep(dataPrev.meta_data.uiMetaData.varibaleSelectionArray,function(val,key){
                    return(val.columnType == "measure" && val.selected == false);
                });
                let dimensionArray = $.grep(dataPrev.meta_data.uiMetaData.varibaleSelectionArray,function(val,key){
                    return(val.columnType == "dimension"  && val.selected == false);
                });
                if(measureArray.length > 10 || (store.getState().datasets.selectedVariablesCount+measureArray.length > 10)){
                    if(store.getState().datasets.measureAllChecked == false)$('.measureAll').prop("disabled",true);
                }
                else
                $('.measureAll').prop("disabled",false);
                if(dimensionArray.length > 10 || (store.getState().datasets.selectedVariablesCount+dimensionArray.length > 10)){
                    if(store.getState().datasets.dimensionAllChecked == false)$(".dimensionAll").prop("disabled",true);
                }
                else
                $(".dimensionAll").prop("disabled",false);

                variableSelectionMsg = <h4>Including performance analysis across the following variables (4 to 10)</h4>;
            }
            return (
                <div>


                    <div className="row">
                        <div className="col-lg-6">
                            {variableSelectionMsg}
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
											<input type="text" name="measure" onChange={this.handleDVSearch.bind(this)} title="Search Measures" id="measureSearch" className="form-control search-box" placeholder="Search measures..."  />
											<span className="zmdi zmdi-search form-control-feedback"></span>
											<button className="close-icon" name="measure" onClick={this.handleDVSearch.bind(this)}  type="reset"></button>
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

												<input type="text" name="dimension" onChange={this.handleDVSearch.bind(this)} title="Search Dimension" id="dimensionSearch" className="form-control search-box" placeholder="Search dimension..."  />
												<span className="zmdi zmdi-search form-control-feedback"></span>
												<button className="close-icon"  name="dimension"  onClick={this.handleDVSearch.bind(this)}  type="reset"></button>

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

												<input type="text" name="datetime" onChange={this.handleDVSearch.bind(this)} title="Search Time Dimensions" id="datetimeSearch" className="form-control search-box" placeholder="Search time dimensions..."/>
												<span className="zmdi zmdi-search form-control-feedback"></span>
												<button className="close-icon" name="datetime" onClick={this.handleDVSearch.bind(this)} type="reset"></button>

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
