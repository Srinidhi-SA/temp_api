import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';

export class DecisionTreeTable extends React.Component {
  constructor(){
    super();
  }
  componentDidMount() {
      HeatMap("heat-table-map");
      //table.find('tr').each(function (i) {
      $(function(){
        $(".idDecisionTreeTable").each(function (i) {
            var $tds = $(this).find('td');
            var $divs  =  $tds.eq(1).find('div');
            var $div2  =  $tds.eq(2).find('div');
            for(var j=0;j<$divs.length;j++){
              $($div2[j]).height($($divs[j]).height());
            }
            $($div2[$divs.length-1]).css({"border-bottom":"0px"});
            $($divs[$divs.length-1]).css({"border-bottom":"0px"});
          });
      });

  }

  render() {
   var element = this.props.tableData.tableData;
   console.log("checking html element");
   console.log(element);
   console.log();
   let thStyle = {
     "border-bottom": "0px",
   };
   let td2Style ={
         "minHeight":"20px",
         "padding":"8px",
         "overflowY":"auto",
         "borderBottom":"1px solid #e6e6e6",
         "width":"100%"
   };
   let td3Style = {
       "minHeight": "20px",
       "padding": "8px",
       "overflowY": "auto",
       "borderBottom": "1px solid rgb(230, 230, 230)",
       "width": "100%",
       "height": "41px"
   };
  let renderTableThead = element[0].map((item,i)=>{
    if(i==0){
      return(
          <th style={thStyle}>{item}</th>
      );
    }else if(i==1){
        return(
        <th width="70%">{item}</th>
      );
    }else if(i==2){
        return(
        <th width="10%">{item}</th>
      );
    }else{
      <th>{item}</th>
    }

});

     let renderTableTbody = element.map((item,i)=>{
       if(i!=0){
           let secondTd =item[1].map((secondItem,secondI)=>{
              let id="id_rule_"+ secondI;
                return(
                  <div key={secondI} style={td2Style} id={id}>{secondItem}</div>
                  );
           });
           let thirdTd =item[2].map((thirdItem,thirdI)=>{
             let id="id_prop_"+ thirdI;
                return(
                  <div style={td3Style} id={id}>{thirdItem}</div>
                  );
           });
              return(
                <tr key={i}>
                <td >{item[0]}</td>
                <td style={{padding:"0px",display:"block"}}>{secondTd}</td>
                <td style={{padding:"0px"}}>{thirdTd}</td>
                </tr>
              );
        }

        });



      return(

        <table className="table table-bordered idDecisionTreeTable">
               <thead><tr> {renderTableThead}</tr></thead>
               <tbody>{renderTableTbody}</tbody>
         </table>

    );

  }
}
