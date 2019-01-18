import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import {C3Chart} from "../c3Chart";
import {DecisionTree} from "../decisionTree";
import {CardHtml} from "./CardHtml";
import {CardTable} from "../common/CardTable";
import {PredictionDropDown} from "../common/predictionDropdown";
//import Tree from 'react-d3-tree';
//import {ReactD3} from "../reactD3";
import { Scrollbars } from 'react-custom-scrollbars';
//import Tree from 'react-tree-graph';
import {GaugeMeter} from "../common/GaugeMeter";
import {DataBox} from "../common/DataBox";
import {WordCloud} from "../common/WordCloud";
import $ from "jquery";
import {handleSignalToggleButton,predictionLabelClick} from "../../helpers/helper";
import {ModelSummeryButton} from "../common/ModelSummeryButton";
import {D3ParallelChartt} from "../D3ParallelChartt";

var data = null,
yformat = null,
cardData = {};

@connect((store) => {
    return {login_response: store.login.login_response, signal: store.signals.signalAnalysis,
        chartObject: store.chartObject.chartObj,currentAppDetails: store.apps.currentAppDetails};
})

export class Card extends React.Component {
    constructor() {
        super();

    }
    componentDidMount() {
	  if(this.props.currentAppDetails&&this.props.currentAppDetails.app_type&&this.props.currentAppDetails.app_type == "REGRESSION")
      $('#box0').parent('div').addClass('text-center');
    }
    handleCheckBoxEvent(event){
        handleSignalToggleButton();
    }
    calculateWidth(width){
        let colWidth  = parseInt((width/100)*12)
        let divClass="col-md-"+colWidth;
        return divClass;
    }
    renderCardData(cardData,toggleTable,cardWidth){
        var htmlData = cardData.map((story, i) => {
            let randomNum = Math.random().toString(36).substr(2,8);
            switch (story.dataType) {
            case "html":
                if(!story.hasOwnProperty("classTag"))story.classTag ="none";
                return (<CardHtml key={randomNum} htmlElement={story.data} type={story.dataType} classTag={story.classTag}/>);
                break;
            case "c3Chart":
                //console.log("checking chart data:::::");
                let chartInfo=[]
                if(!$.isEmptyObject(story.data)){
                   if(story.chartInfo){
                     chartInfo=story.chartInfo
                   }
                    if(story.widthPercent &&  story.widthPercent != 100){
                      //  let width  = story.widthPercent+"%";
                        let width  = parseInt((story.widthPercent/100)*12)
                        let divClass="col-md-"+width;
                        let sideChart=false;
                        if(story.widthPercent < 50)sideChart=true;
                        return (<div key={randomNum} class={divClass} style={{display:"inline-block",paddingLeft:"30px"}}><C3Chart chartInfo={chartInfo} sideChart={sideChart} classId={randomNum}  widthPercent = {story.widthPercent} data={story.data.chart_c3}  yformat={story.data.yformat} y2format={story.data.y2format} guage={story.data.gauge_format} tooltip={story.data.tooltip_c3} tabledata={story.data.table_c3} tabledownload={story.data.download_url} xdata={story.data.xdata}/><div className="clearfix"/></div>);
                    }else if(story.widthPercent == 100){
                        let divClass="";
                        let parentDivClass = "col-md-12";
                        if(!cardWidth || cardWidth > 50)
                        divClass = "col-md-7 col-md-offset-2"
                        else
                        divClass = "col-md-12";
                        let sideChart=false;
                        return (<div className={parentDivClass}><div key={randomNum} class={divClass} style={{display:"inline-block",paddingLeft:"30px"}}><C3Chart chartInfo={chartInfo} sideChart={sideChart} classId={randomNum}  widthPercent = {story.widthPercent} data={story.data.chart_c3}  yformat={story.data.yformat} y2format={story.data.y2format} guage={story.data.gauge_format} tooltip={story.data.tooltip_c3} tabledata={story.data.table_c3} tabledownload={story.data.download_url} xdata={story.data.xdata}/><div className="clearfix"/></div></div>);
                    }else{
                        let parentDivClass = "col-md-12";
                        return (<div className={parentDivClass}><div key={randomNum}><C3Chart chartInfo={chartInfo} classId={randomNum} data={story.data.chart_c3} yformat={story.data.yformat} y2format={story.data.y2format}  guage={story.data.gauge_format} tooltip={story.data.tooltip_c3} tabledata={story.data.table_c3} tabledownload={story.data.download_url} xdata={story.data.xdata}/><div className="clearfix"/></div></div>);
                    }
                }
                break;
            case "tree":
                //console.log("checking tree data");
                return ( <DecisionTree key={randomNum} treeData={story.data}/>);
                break;
            case "table":
                if(!story.tableWidth)story.tableWidth = 100;
                var colClass= this.calculateWidth(story.tableWidth)
                colClass = colClass;
             return (<div className={colClass} key={randomNum}><CardTable classId={toggleTable} jsonData={story.data} type={story.dataType}/></div>);
                break;
            case "dropdown":
                return (<PredictionDropDown key={randomNum} label={story.label} jsonData={story.data} type={story.dataType}/>);
                break;
            case "gauge":
                return (<GaugeMeter key={randomNum} jsonData={story.data} type={story.dataType}/>);
                break;
            case "dataBox":
                return (<DataBox key={randomNum} jsonData={story.data} type={story.dataType}/>);
                break;
            case "wordCloud":
                return (<WordCloud key={randomNum} jsonData={story.data} type={story.dataType}/>);
                break;
            case "toggle":
            var tableData = [];
            tableData.push(story.data.toggleon);
            var toggleData =  this.renderCardData(tableData,"toggleOn");
            tableData = [];
            tableData.push(story.data.toggleoff);
             var toggleData1 = this.renderCardData(tableData,"toggleOff hidden");
             var randomChk = randomNum+"_chk"
            var inputChk =  <div className="switch-button switch-button-yesno col-md-1 col-md-offset-11">
            <input type="checkbox" name={randomChk} value={randomChk} id={randomChk} onClick={this.handleCheckBoxEvent.bind(this)}/><span>
            <label for={randomChk}></label></span>
            </div>
            return (<div key={randomNum}>{inputChk}{toggleData}{toggleData1}</div>);
            break;
            case "kpi":
            let boxData = story.data;
            let divClass = "text-center";
              if(story.widthPercent &&  story.widthPercent != 100){
                        //let width  = parseInt((story.widthPercent/100)*20);
                        divClass="col-md-4 bgStockBox";
              }
			 return(
			<div className={divClass}>
               
			    <h3 className="text-center xs-m-0">{boxData.value}
				<br/>
				<small>{boxData.text}</small>
				</h3>
			    
                
            </div>
			);
            break;
            case "button":
            return (<ModelSummeryButton key={randomNum} data={story.data.chart_c3} tabledownload={story.data.download_url} classId={randomNum} type={story.dataType}/>);
            break;
            case "parallelCoordinates":
            return(<D3ParallelChartt key={randomNum} data={story.data} hideColumns={story.hideColumns} hideaxes={story.ignoreList} id={this.props.id} evaluationMetricColName={story.evaluationMetricColName} columnOrder={story.columnOrder}/>);
            break;
            }

        });
        return htmlData;
    }
    render() {
        console.log("card is called!!!! with data:----");
        cardData = this.props.cardData;
		let stockClassName = "";
		if (window.location.pathname.indexOf("apps-stock-advisor")>-1)
		stockClassName = "stockClassName";
		
        let cardWidth = this.props.cardWidth;
        const cardElements = this.renderCardData(cardData,'',cardWidth);
        return (
                <div className = {stockClassName}>
                {cardElements}
                </div>
        );

    }
}
