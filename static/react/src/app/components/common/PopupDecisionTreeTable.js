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
    this.showDecisionTreePopup = this.showDecisionTreePopup.bind(this);
  }
  showDecisionTreePopup(evt){
     bootbox.alert({title: "Prediction Rule",
             message: evt.target.name});
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
                else return <th key={j}>{colData}</th>;
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
              var rows = rowData.map(function(colData,j) {
                   if(j == 0)
                      return<td key={j} className="cursor" onClick={that.showDecisionTreePopup}><a name={colData}>{colData.slice(0, MAXTEXTLENGTH)}...</a></td>;
                      else{
                          if(j == colLength-1)return  <td class="hidden" key={j}>{colData}</td>    
                          return  <td key={j}>{colData}</td>       
                      }
              });
              return<tr key={i}>{rows}</tr>;
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
           <div class="table-style-custom">
             <Scrollbars style={{ height: 200 }} 
               className="thumb-horizontal" >
           <table className={className}>
               <thead><tr>{headerComponents}</tr></thead>
             
               <tbody>{rowComponents}</tbody>
             
           </table>
             </Scrollbars>
           </div>
       );
  }
}
