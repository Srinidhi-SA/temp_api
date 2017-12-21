import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {getSignalAnalysis,handleDecisionTreeTable} from "../../actions/signalActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {generateHeaders,generateNormalTableRows} from "../../helpers/helper";
import { Scrollbars } from 'react-custom-scrollbars';
import {MAXTEXTLENGTH} from "../../helpers/helper";


@connect((store) => {
    return { selPrediction: store.signals.selectedPrediction};
  })
  
export class PopupDecisionTreeTable extends React.Component {
  constructor(props){
    super(props);
   
  }
  showDecisionTreePopup(rule){
     bootbox.alert({title: "Prediction Rule",
             message: rule});
  }
  componentDidMount(){
      handleDecisionTreeTable();
  }
  componentDidUpdate(){
      handleDecisionTreeTable();
  }
  generatePredTableHeaders(table) {
      var cols = table.tableData.map(function(rowData,i){
          var colLength = rowData.length;
        if(i== 0){
            return rowData.map(function(colData,j) {
                if(j == colLength-1)return <th class="hidden" key={j}>{colData}</th>
                else if(j == 0) return <th  style={{width:"60%"}}  key={j}>{colData}</th>;
                else return <th class="text-center" key={j}>{colData}</th>;
                 });
        }
      })
    return cols;
  }
generateDecisionTreeRows(table) {
    var that = this;
      var tbodyData = table.tableData.map(function(rowData,i){
          var colLength = rowData.length;
          if(i != 0){
              var rule ="";
              var rows = rowData.map(function(colData,j) {
                  
                   if(j == 0){
                       rule=colData
                       return<td key={j} className="cursor">{colData.length > MAXTEXTLENGTH ? colData.slice(0, MAXTEXTLENGTH).concat("...") : colData}</td>;
                   }
                      else if(j == colLength-1)return  <td class="hidden" key={j}>{colData}</td> 
                      else return  <td class="text-center" key={j}>{colData}</td>       
                      
              });
              return<tr key={i}>{rows}<td class="cursor text-center" onClick={that.showDecisionTreePopup.bind(this,rule)}><a href="javascript:;" class="btn btn-space btn-primary btn-rounded btn-xs"><i class="zmdi zmdi-hc-lg zmdi-more"></i></a></td></tr>;
          }
        })
      return tbodyData;
      }
  render() {
   var data = this.props.tableData;
   var className = "table table-bordered popupDecisionTreeTable"
   console.log("checking popup decision tree tabletable element");
   var headerComponents = this.generatePredTableHeaders(data);
   var rowComponents = this.generateDecisionTreeRows(data);
   return (
           <div class="table-style_2">
           {/* <Scrollbars style={{ height: 200 }} 
               className="thumb-horizontal" > */}  
           <table className={className}>
               <thead><tr>{headerComponents}<th width="2%">Details</th></tr></thead>
             
               <tbody>{rowComponents}</tbody>
             
           </table>
             {/* </Scrollbars>*/}
           </div>
       );
  }
}
