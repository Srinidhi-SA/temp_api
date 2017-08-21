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
	}
