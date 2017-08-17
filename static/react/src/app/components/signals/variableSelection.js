import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import store from "../../store";

import {openCreateSignalModal,closeCreateSignalModal} from "../../actions/createSignalActions";
import {DataVariableSelection} from "../data/DataVariableSelection";
// var dataSelection= {
//      "metaData" : [   {"name": "Rows", "value": 30, "display":true},
//                       {"name": "Measures", "value": 10, "display":true},
//                      {"name": "Dimensions", "value": 5, "display":true},
//                      {"name": "Ignore Suggestion", "value": 20, "display":false}
//                  ],
//
//     "columnData" : [{
// 			"name": "Age",
// 			"slug": "age_a",
// 			"columnStats":[ {"name": "Mean", "value":100}, {"name": "Sum", "value":1000}, {"name": "Min", "value":0},
// 							 {"name": "Max", "value":1000}	],
// 			"chartData" : {
//                       "data": {
//                   "columns": [
//                       ['data1', 30, 200, 100, 400, 150, 250]
//
//                   ],
//                   "type": 'bar'
//               },
//               "size": {
//                 "height": 200
//               },
//               "legend": {
//                  "show": false
//                },
//               "bar": {
//                   "width": {
//                       "ratio": 0.5
//                   }
//
//               }
//           },
// 			"columnType": "measure"
//       },
//   	  {
//   			"name": "Name",
//   			"slug": "name_a",
//   			"columnStats":[ {"name": "Mean", "value":200}, {"name": "Sum", "value":2000}, {"name": "Min", "value":0},
//   							 {"name": "Max", "value":1000}	],
//   			"chartData" : {
//                         "data": {
//                     "columns": [
//                         ['data1', 30, 200, 100, 400, 150, 750]
//
//                     ],
//                     "type": 'bar'
//                 },
//                 "size": {
//                   "height": 200
//                 },
//                 "legend": {
//                 "show": false
//               },
//                 "bar": {
//                     "width": {
//                         "ratio": 0.5
//                     }
//
//                 }
//             },
//   			"columnType": "dimension"
//       },
//       {
//   			"name": "Sale Date",
//   			"slug": "sale_a",
//   			"columnStats":[ {"name": "Mean", "value":1100}, {"name": "Sum", "value":1030}, {"name": "Min", "value":0},
//   							 {"name": "Max", "value":1000}	],
//   			"chartData" : {
//                         "data": {
//                     "columns": [
//                         ['data1', 30, 200, 100, 400, 950, 250]
//
//                     ],
//                     "type": 'bar'
//                 },
//                 "size": {
//                   "height": 200
//                 },
//                 "legend": {
//                    "show": false
//                  },
//                 "bar": {
//                     "width": {
//                         "ratio": 0.5
//                     }
//
//                 }
//             },
//   			"columnType": "datetime"
//         }],
//     "headers" :[
//         {   "name": "Age",
//           "slug" : "age_a" },
// 		  {   "name": "Name",
//           "slug" : "name_a", },
//           {   "name": "Sale Date",
//               "slug" : "sale_a", }
//
//       ],
//     "sampleData" :[[20,30,'20/01/1990'],
// 	               [33,44,'10/01/1990'],
// 				   [24,33,'30/01/1990'],
// 				   [44,36,'20/02/1990']]
// };

var selectedVariables = {measures:[],dimensions:[],date:null};  // pass selectedVariables to config

@connect((store) => {
	return {login_response: store.login.login_response,
		newSignalShowModal: store.signals.newSignalShowModal,
		dataList: store.datasets.dataList,
  dataPreview: store.datasets.dataPreview};
})

export class VariableSelection extends React.Component {
	constructor(props) {
		super(props);
    // this.state={
    //   countOfSelected:0,
    //   radioChecked:""
    // };
    console.log("preview data check");
	}



// componentDidMount(){
//   var that = this;
//  $(function(){
//    selectedVariables.date = $("#rad_dt0").val();
//     $("[type='radio']").click(function(){
//         // let count=0;
//          let id=$(this).attr("id");
//
//         selectedVariables.date = $("#"+id).val();
//          that.setState(previousState => {
//           return {radioChecked:id
//                     };
//         });
//         console.log(selectedVariables);
//
//
//     });
//
//    $("#mea").click(function(){   // select all measure clicked
//      let count=0;
//       if($(this).is(":checked")){
//         $('.measure[type="checkbox"]').prop('checked', true);
//       }else{
//         $('.measure[type="checkbox"]').prop('checked', false);
//       }
//       selectedVariables.dimensions=[];
//       $('.dimension[type="checkbox"]').each(function(){
//
//          if($(this).is(":checked")){
//            count++;
//            selectedVariables.dimensions.push($(this).val());
//          }
//       });
//
//       selectedVariables.measures=[];
//       $('.measure[type="checkbox"]').each(function(){
//
//          if($(this).is(":checked")){
//            count++;
//            selectedVariables.measures.push($(this).val());
//          }
//       });
//
//
//       console.log(selectedVariables);
//
//       that.setState(previousState => {
//        return { countOfSelected: count};
//      });
//    });
//
//    $("#dim").click(function(){     // select all dimension clicked
//      let count=0;
//       if($(this).is(":checked")){
//          $('.dimension[type="checkbox"]').prop('checked', true);
//       }else{
//          $('.dimension[type="checkbox"]').prop('checked', false);
//       }
//
//       selectedVariables.dimensions=[];
//       $('.dimension[type="checkbox"]').each(function(){
//
//          if($(this).is(":checked")){
//            count++;
//            selectedVariables.dimensions.push($(this).val());
//          }
//       });
//       selectedVariables.measures=[];
//       $('.measure[type="checkbox"]').each(function(){
//
//          if($(this).is(":checked")){
//            count++;
//            selectedVariables.measures.push($(this).val());
//          }
//       });
//
//     console.log(selectedVariables);
//
//       that.setState(previousState => {
//        return { countOfSelected: count};
//      });
//
//    });
//
// $('.measure[type="checkbox"]').click(function(){
//   let count = 0;
//   selectedVariables.measures=[];
//   $('.measure[type="checkbox"]').each(function(){
//      if(!$(this).is(":checked")){
//        $('#mea[type="checkbox"]').prop('checked',false);
//      }else{
//
//        count++;
//         selectedVariables.measures.push($(this).val());
//      }
//   });
//   selectedVariables.dimensions=[];
//   $('.dimension[type="checkbox"]').each(function(){
//
//      if(!$(this).is(":checked")){
//        $('#mea[type="checkbox"]').prop('checked',false);
//      }else{
//
//        count++;
//        selectedVariables.dimensions.push($(this).val());
//      }
//   });
//
//  console.log(selectedVariables);
//
//   that.setState(previousState => {
//    return { countOfSelected: count};
//  });
//
// });
//
// $('.dimension[type="checkbox"]').click(function(){
//   let count=0;
//    selectedVariables.dimensions=[];
//   $('.dimension[type="checkbox"]').each(function(){
//      if(!$(this).is(":checked")){
//        $('#dim[type="checkbox"]').prop('checked',false);
//      }else{
//
//        count++;
//        selectedVariables.dimensions.push($(this).val());
//      }
//   });
//    selectedVariables.measures=[];
//   $('.measure[type="checkbox"]').each(function(){
//      if(!$(this).is(":checked")){
//        $('#mea[type="checkbox"]').prop('checked',false);
//      }else{
//
//        count++;
//         selectedVariables.measures.push($(this).val());
//      }
//   });
//
//    console.log(selectedVariables);
//
//   that.setState(previousState => {
//    return { countOfSelected: count};
//  });
// });
//
//  });
//
// }

	render() {

		return (
<div className="side-body">
      <div className="main-content">
<div className="panel panel-default">
  <div className="panel-body">

  <div className="row">
  <div className="col-lg-4">
      <div className="htmlForm-group">
        <select className="htmlForm-control" id="selectAnalyse">
          <option>I want to analyze</option>
          <option>I want to analyze 2</option>
          <option>I want to analyze 3</option>
          <option>I want to analyze 4</option>
        </select>
      </div>
  </div>{/*<!-- /.col-lg-4 -->*/}

  </div>{/*<!-- /.row -->*/}
 {/*  adding selection component */}
       <DataVariableSelection/>
 {/*---------end of selection component----------------------*/}
  <div className="row">
    <div className="col-md-12">
      <div className="panel panel-alt4 panel-borders">
        <div className="panel-heading text-center">PerhtmlForming the following Analysis</div>
        <div className="panel-body text-center">
          <div className="ma-checkbox inline"><input id="chk_analysis0" type="checkbox" className="needsclick"/><label htmlFor="chk_analysis0">Distribution Analysis </label></div>
          <div className="ma-checkbox inline"><input id="chk_analysis1" type="checkbox" className="needsclick"/><label htmlFor="chk_analysis1">Trend Analysis </label></div>
          <div className="ma-checkbox inline"><input id="chk_analysis2" type="checkbox" className="needsclick"/><label htmlFor="chk_analysis2">Anova </label></div>
          <div className="ma-checkbox inline"><input id="chk_analysis3" type="checkbox" className="needsclick"/><label htmlFor="chk_analysis3">Regression </label></div>
          <div className="ma-checkbox inline"><input id="chk_analysis4" type="checkbox" className="needsclick"/><label htmlFor="chk_analysis4">Decision Tree</label></div>
          <hr/>
          <div className="pull-left">
          <div className="ma-checkbox inline"><input id="chk_results" type="checkbox" className="needsclick"/><label htmlFor="chk_results">Statistically Significant Results</label></div>
          </div>
          <div className="pull-right">
          <a href="javascript:void(0);" className="pull-right">Go to advanced settings</a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div className="row">
    <div className="col-lg-4 col-lg-offset-8">
      <div className="htmlForm-group">
        <input type="text" name="createSname" id="createSname" className="htmlForm-control input-sm" placeholder="Enter a signal name"/>
      </div>
    </div>{/*<!-- /.col-lg-4 -->*/}
  </div>
  <hr/>
  <div className="row">
    <div className="col-md-12 text-right">
      <button className="btn btn-primary">CREATE SIGNAL</button>
    </div>
  </div>


  </div>
</div>
    </div>
</div>

		)
	}

}
