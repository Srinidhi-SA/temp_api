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

var data = null,
yformat = null,
cardData = {};

@connect((store) => {
    return {login_response: store.login.login_response, signal: store.signals.signalAnalysis,
        chartObject: store.chartObject.chartObj};
})

export class Card extends React.Component {
    constructor() {
        super();

    }

    handleCheckBoxEvent(event){
        handleSignalToggleButton();
    }
    calculateWidth(width){
        let colWidth  = parseInt((width/100)*12)
        let divClass="col-md-"+colWidth;
        return divClass;
    }
    renderCardData(cardData,toggleTable){
        var htmlData = cardData.map((story, i) => {
            let randomNum = Math.random().toString(36).substr(2,8);
            switch (story.dataType) {
            case "html":
                if(!story.hasOwnProperty("classTag"))story.classTag ="none";
                return (<CardHtml key = {i} htmlElement={story.data} type={story.dataType} classTag={story.classTag}/>);
                break;
            case "c3Chart":
                //console.log("checking chart data:::::");
                if(!$.isEmptyObject(story.data)){
                   // story.chartInfo =[]
                    if(story.widthPercent &&  story.widthPercent != 100){
                      //  let width  = story.widthPercent+"%";
                        let width  = parseInt((story.widthPercent/100)*12)
                        let divClass="col-md-"+width;
                        let sideChart=false;
                        if(story.widthPercent < 50)sideChart=true;
                        return (<div key={randomNum} class={divClass} style={{display:"inline-block",paddingLeft:"30px"}}><C3Chart chartInfo={story.chartInfo} sideChart={sideChart} classId={randomNum} widthPercent = {story.widthPercent} data={story.data.chart_c3}  yformat={story.data.yformat} y2format={story.data.y2format} guage={story.data.gauge_format} tooltip={story.data.tooltip_c3} tabledata={story.data.table_c3} tabledownload={story.data.download_url} xdata={story.data.xdata}/><div className="clearfix"/></div>);
                    }else{
                        return (<div key={randomNum}><C3Chart chartInfo={story.chartInfo} classId={randomNum} data={story.data.chart_c3} yformat={story.data.yformat} y2format={story.data.y2format} guage={story.data.gauge_format} tooltip={story.data.tooltip_c3} tabledata={story.data.table_c3} tabledownload={story.data.download_url} xdata={story.data.xdata}/><div className="clearfix"/></div>);
                    }
                }
                break;
            case "tree":
                //console.log("checking tree data");
                return ( <DecisionTree key={i} treeData={story.data}/>);
                break;
            case "table":
                if(!story.tableWidth)story.tableWidth = 100;
                var colClass= this.calculateWidth(story.tableWidth)
                colClass = colClass;
             return (<div className={colClass} ><CardTable classId={toggleTable} key = {i} jsonData={story.data} type={story.dataType}/></div>);
                break;
            case "dropdown":
                return (<PredictionDropDown key = {i} label={story.label} jsonData={story.data} type={story.dataType}/>);
                break;
            case "gauge":
                return (<GaugeMeter key = {i} jsonData={story.data} type={story.dataType}/>);
                break;
            case "dataBox":
                return (<DataBox key = {i} jsonData={story.data} type={story.dataType}/>);
                break;
            case "wordCloud":
                return (<WordCloud key = {i} jsonData={story.data} type={story.dataType}/>);
                break;
            case "toggle":
            var tableData = [];
            tableData.push(story.data.toggleon);
            tableData.push(story.data.toggleoff);
            var toggleData =  this.renderCardData(tableData,"toggleTable");
            var inputChk =  <div className="switch-button switch-button-yesno col-md-1 col-md-offset-11">
            <input type="checkbox" name="vehicle" value="Bike" id="swt9" onClick={this.handleCheckBoxEvent.bind(this)}/><span>
            <label for="swt9"></label></span>
            </div>
            return (<div>{inputChk}{toggleData}</div>);
            break;

            }

        });
        return htmlData;
    }
    render() {
        console.log("card is called!!!! with data:----");
        cardData = this.props.cardData;
        const cardElements = this.renderCardData(cardData);
        return (
                <div>
                {cardElements}
                </div>
        );

    }
}
