import React from "react";
import CircularProgressbar from 'react-circular-progressbar';
import {Redirect} from 'react-router';
import {handleDecisionTreeTable} from "../actions/signalActions";
import renderHTML from 'react-render-html';

export function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
}

var  USERDETAILS = {};
export function handleSignalToggleButton(){
    if($(".toggleOn").is(":visible")){
        $(".toggleOff").removeClass("hidden");
        $(".toggleOn").addClass("hidden")
    }else{
        $(".toggleOn").removeClass("hidden");
        $(".toggleOff").addClass("hidden")
    }
}

export const getUserDetailsOrRestart = {
		get : function(){
			let  userDetails = {};
			if(document.cookie){
				let allCookies = document.cookie.split(";");
				for(let i=0;i<allCookies.length;i++){
					let cur = allCookies[i].split('=');
					userDetails[cur[0].replace(/\s/g, '')] = cur[1];
				}
				return userDetails;
			}else{
				redirectToLogin();
			}

		}
}

function redirectToLogin() {
	var noOfUrls = window.history.length;
	window.history.go("-"+noOfUrls-1);
	//window.history.replaceState(null,null,"login");
}


const FILEUPLOAD = "File Upload";
const MYSQL = "MySQL";
const INPUT = "Input";
const HOST = "Host";
const PORT = "Port";
const SCHEMA = "Schema";
const USERNAME = "Username";
const PASSWORD = "Password";
const TABLENAME = "tablename";
const PERPAGE = 11;
const NORMALTABLE = "normal";
const CONFUSIONMATRIX = "confusionMatrix";
const HEATMAPTABLE = "heatMap";
const CIRCULARCHARTTABLE = "circularChartTable";
const DECISIONTREETABLE = "decisionTreeTable"
const DULOADERPERVALUE = 1;
const CSLOADERPERVALUE = 1;
const APPSLOADERPERVALUE = 10;
const LOADERMAXPERVALUE = 99;
const DEFAULTINTERVAL = 10000;
const APPSDEFAULTINTERVAL = 15000;
const CUSTOMERDATA = "Customer Data";
const HISTORIALDATA = "Historial Data";
const EXTERNALDATA = "External Data";
const DELETEMODEL = "Delete Model";
const RENAMEMODEL = "Rename Model";
const DELETESCORE = "Delete Score";
const RENAMESCORE = "Rename Score";
const DELETEINSIGHT = "Delete Insight";
const RENAMEINSIGHT = "Rename Insight";
const SEARCHCHARLIMIT = 2;
const SUCCESS = "SUCCESS";
const FAILED = "FAILED";
const INPROGRESS  = "INPROGRESS";
const APPNAME1 = "OPPORTUNITY SCORING";
const APPNAME2 ="AUTOMATED PREDICTION";
const APPNAME3 = "ROBO INSIGHTS";
const APPNAME5 = "STOCK ADVISOR";
const APPID1 = 1;
const APPID2 = 2;
const APPID3 = 3;
const APPID5 = 5;
const CUSTOMER = "customer";
const HISTORIAL = "historial";
const EXTERNAL = "external";
const APPID4 = 4;
const APPNAME4 = "Speech Analytics";
const DELETEAUDIO = "Delete Media File";
const RENAMEAUDIO = "Rename Media File";
const DULOADERPERMSG = "Initialized the filter parameters";
const RENAME = "rename";
const DELETE = "delete";
const REPLACE = "replace";
const DATA_TYPE = "data_type";
const REMOVE = "remove";
const CURRENTVALUE = "current value";
const NEWVALUE = "new value";
const TEXTHEATMAPTABLE = "textHeatMapTable";
const DEFAULTANALYSISVARIABLES = "high";
const MINROWINDATASET = 10;
const APPSPERPAGE = 9;
const POPUPDECISIONTREETABLE = "popupDecisionTreeTable";
const MAXTEXTLENGTH = 100;
const SET_VARIABLE = "set_variable";
const DIMENSION = "dimension";
const MEASURE = "measure";
const PERCENTAGE ="percentage";
const GENERIC_NUMERIC = "generic_numeric";
const SET_POLARITY= "set_polarity";
const UNIQUE_IDENTIFIER = "unique_identifier";
const DYNAMICLOADERINTERVAL = 2000;


export function generateHeaders(table) {
    var cols = table.tableData.map(function(rowData,i){
  	  if(i== 0){
  		  return rowData.map(function(colData,j) {
    	           return<th key={j}>{colData}</th>;
    	       });
  	  }
    })
  return cols;
}

export function generateHeatMapHeaders(table) {
    var cols = table.tableData.map(function(rowData,i){
  	  if(i== 0){
  		  var row=rowData.map(function(colData,j) {
    	           return<th key={j} className="first">{colData}</th>;
    	       });
		  return<tr key={i} className="heatMapHeader">{row}</tr>
  	  }
    })

  return cols;
}

export function generateHeatMapRows(table) {
    var cols = table.tableData.map(function(rowData,i){
  	  if(i!= 0){
  		  var row=rowData.map(function(colData,j) {
			      if(j==0){
					  return<td key={j} className="stats-title">{colData}</td>;
				  }else{
					 return<td key={j}>{colData}</td>;
				  }

    	       });
		  return<tr key={i} className="stats-row">{row}</tr>
  	  }
    })

  return cols;
}

export function generateTextHeatMapRows(table) {
    var cols = table.tableData.map(function(rowData,i){
  	  if(i!= 0){
  		  var row=rowData.map(function(colData,j) {
          console.log(colData)
			      if(colData.value == 0 && colData.text == "" ){
					  return<td key={j} value={colData.value}></td>;
				  }else{
					 //return<td key={j}>{colData.text}<br/>{colData.value}</td>;
           return<td key={j} value={colData.value}>{colData.text}<br/><b>{colData.value}</b></td>;
				  }

    	       });
		  return<tr key={i} className="stats-row">{row}</tr>
  	  }
    })

  return cols;
}

export function  generateCircularChartRows(table) {
var tbodyData = table.tableData.map(function(rowData,i){
	if(i != 0){
		var rows = rowData.map(function(colData,j) {
			if(isNaN(colData))
  	           return<td key={j}>{colData}</td>;
  	           else
  	        	    return<td key={j}><CircularProgressbar percentage={colData} initialAnimation={true}/></td>;
  	       });
		return<tr key={i}>{rows}</tr>;
	}
  })
return tbodyData;
}
export function  generateRows(table) {
	var tbodyData = table.tableData.map(function(rowData,i){
		if(i != 0){
			var rows = rowData.map(function(colData,j) {
	  	           return<td key={j}>{colData}</td>;
	  	       });
			return<tr key={i}>{rows}</tr>;
		}
	  })
	return tbodyData;
	}

export function  generateNormalTableRows(table) {
	var tbodyData = table.tableData.map(function(rowData,i){
		if(i != 0){
			var rows = rowData.map(function(colData,j) {
				if(j == 0 || j == 1)
	  	           return<td key={j}>{colData}</td>;

	  	           else
	  	        	return<td key={j}>{colData}</td>;
	  	       });
			return<tr key={i}>{rows}</tr>;
		}
	  })
	return tbodyData;
	}

export function  subTreeSetting(urlLength, length,paramL2) {
	  $(function(){

	    if(urlLength == length ){  //show -hide subtree and active class of subtree element
		  $(".sb_navigation").show();
		   $(".sb_navigation #subTab i.mAd_icons.ic_perf ~ span").each(function(){
				console.log($(this).html() +" == "+ paramL2);
				if($(this).attr('id') == paramL2){
				  $(this).parent().addClass('active');
				}else{
				  $(this).parent().removeClass('active');
				}
			   });

	  }else{
			  $(".sb_navigation").hide();
	  } // end of show -hide subtree and active class of subtree element


	   if($(".list-group").children()){ // show hide side panel list
		 if($(".list-group").children().length == 1){
	    $('.row-offcanvas-left').addClass('active');
		$('.sdbar_switch i').removeClass('sw_on');
		$('.sdbar_switch i').addClass('sw_off');
		   }
          }


		/*  if(that.showSubTree){   // for sub tree active class check
       $(".sb_navigation #subTab i.mAd_icons.ic_perf ~ span").each(function(){
        console.log($(this).html() +" == "+ that.props.match.params.l2);
        if($(this).attr('id') == that.props.match.params.l2){
          $(this).parent().addClass('active');
        }else{
          $(this).parent().removeClass('active');
        }
       });
     }*/


	  });

	}


	export function  showHideSideChart(colType,chartData) {

		if(colType =="datetime" || $.isEmptyObject(chartData)){
				$(function(){
			       $("#tab_visualizations #pnl_visl").removeClass("in");
                   $("#tab_visualizations a").addClass("collapsed");
				});
			}else{
				$(function(){
			       $("#tab_visualizations #pnl_visl").addClass("in");
                   $("#tab_visualizations a").removeClass("collapsed");
                   $("#tab_visualizations #pnl_visl").removeAttr("style");
				});
			}


	}

		export function  showHideSideTable(colstats) {
			let flag = false

			for(var i =0; i<colstats.length;i++){
				if(colstats[i].display){
					flag=true;
				}
			}


		if(colstats.length == 0 || !flag){

			$("#tab_statistics #pnl_stc").removeClass("in");
			$("#tab_statistics a").addClass("collapsed");
		}else{

			$("#tab_statistics #pnl_stc").addClass("in");
			$("#tab_statistics a").removeClass("collapsed");
      $("#tab_statistics #pnl_stc").removeAttr("style");


		}

	}

  export function  showHideSubsetting(colType,subsetData,dateflag) {

		if(dateflag == true||(colType == "dimension" && $.isEmptyObject(subsetData))){
				$(function(){
			       $("#tab_subsettings #pnl_tbset").removeClass("in");
                   $("#tab_subsettings a").addClass("collapsed");
                   $("#saveSubSetting").hide();
				});
			}else{
      				$(function(){
			       $("#tab_subsettings #pnl_tbset").addClass("in");
                   $("#tab_subsettings a").removeClass("collapsed");
                    $("#tab_subsettings #pnl_tbset").removeAttr("style");
                   $("#saveSubSetting").show();
				});

    }


	}

  export function decimalPlaces(number) {
    // toFixed produces a fixed representation accurate to 20 decimal places
    // without an exponent.
    // The ^-?\d*\. strips off any sign, integer portion, and decimal point
    // leaving only the decimal fraction.
    // The 0+$ strips off any trailing zeroes.
    return ((+ number).toFixed(4)).replace(/^-?\d*\.?|0+$/g, '').length;
  }

export{
	FILEUPLOAD,
	MYSQL,
	INPUT,
	PASSWORD,
	HOST,
	PORT,
	SCHEMA,
	USERNAME,
	TABLENAME,
	PERPAGE,
	NORMALTABLE,
	CONFUSIONMATRIX,
	HEATMAPTABLE,
	CIRCULARCHARTTABLE,
	DECISIONTREETABLE,
	DULOADERPERVALUE,
	CSLOADERPERVALUE,
	LOADERMAXPERVALUE,
	DEFAULTINTERVAL,
	APPSDEFAULTINTERVAL,
	CUSTOMERDATA,
	HISTORIALDATA,
	EXTERNALDATA,
	DELETEMODEL,
	RENAMEMODEL,
	DELETESCORE,
	RENAMESCORE,
	DELETEINSIGHT,
	RENAMEINSIGHT,
	SEARCHCHARLIMIT,
	SUCCESS,
	FAILED,
	INPROGRESS,
	APPNAME1,
	APPNAME2,
	APPNAME3,
	APPID1,
	APPID2,
	APPID3,
	CUSTOMER,
	HISTORIAL,
	EXTERNAL,
	APPID4,
	APPNAME4,
	RENAMEAUDIO,
	DELETEAUDIO,
    DULOADERPERMSG,
    RENAME,
	DELETE,
	REPLACE,
	DATA_TYPE,
	REMOVE,
	CURRENTVALUE,
	NEWVALUE,
	APPID5,
	APPNAME5,
	TEXTHEATMAPTABLE,
	APPSLOADERPERVALUE,
	USERDETAILS,
	DEFAULTANALYSISVARIABLES,
  MINROWINDATASET,
  APPSPERPAGE,
  POPUPDECISIONTREETABLE,
  MAXTEXTLENGTH,
  SET_VARIABLE,
  DIMENSION,
  MEASURE,
  PERCENTAGE,
  GENERIC_NUMERIC,
  SET_POLARITY,
  UNIQUE_IDENTIFIER,
  DYNAMICLOADERINTERVAL
	}
export function capitalizeArray(array){
  let a =[]
  let i=0
  for (var val in array){
    a[i]= array[val].charAt(0).toUpperCase() + array[val].slice(1);i++;
  }
  return a
}
export function predictionLabelClick(){
    var cell =document.querySelectorAll('.pred_disp_block');
    for(var i=0;i<cell.length;i++){
    cell[i].addEventListener('click',handleDecisionTreeTable,false);
  }

}

export function renderC3ChartInfo(info){
    if(!isEmpty(info)){

        var listOfData = "";
        info.map((item,index)=>{
            listOfData += "<p>"+item+"</p>";
        });
        bootbox.dialog({title: "Statistical Info",
            size: 'small',
            closeButton: true,
            message: "<div>"+listOfData+"</div>"})
    }

}
