import React from "react";
import CircularProgressbar from 'react-circular-progressbar';


export function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
}
const FILEUPLOAD = "File Upload";
const MYSQL = "MySQL";
const INPUT = "Input";
const HOST = "Host";
const PORT = "Port";
const SCHEMA = "Schema";
const USERNAME = "Username";
const PASSWORD = "Password";
const TABLENAME = "Table Name";
const PERPAGE = 10; 
const NORMALTABLE = "normal";
const CONFUSIONMATRIX = "confusionMatrix";
const HEATMAPTABLE = "heatMap";
const CIRCULARCHARTTABLE = "circularChartTable";
const DECISIONTREETABLE = "decisionTreeTable"
const DULOADERPERVALUE = 10;
const CSLOADERPERVALUE = 10;
const LOADERMAXPERVALUE = 90;
const DEFAULTINTERVAL = 20000;
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

export function  generateCircularChartRows(table) {
var tbodyData = table.tableData.map(function(rowData,i){
	if(i != 0){
		var rows = rowData.map(function(colData,j) {
			if(j == 0)
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
	
	
	export function  showHideSideChart(colType) {
		if(colType =="datetime"){
				$(function(){
			       $("#tab_visualizations #pnl_visl").removeClass("in");
                   $("#tab_visualizations a").addClass("collapsed");
				});
			}else{
				$(function(){
			       $("#tab_visualizations #pnl_visl").addClass("in");
                   $("#tab_visualizations a").removeClass("collapsed");
				});
			}
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
	}
