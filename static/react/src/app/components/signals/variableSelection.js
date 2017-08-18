import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import store from "../../store";

import {openCreateSignalModal,closeCreateSignalModal} from "../../actions/createSignalActions";
import {selectedAnalysisList} from "../../actions/dataActions";
import {createSignal} from "../../actions/signalActions";
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
  dataPreview: store.datasets.dataPreview,
  selectedMeasures:store.datasets.selectedMeasures,
  selectedDimensions:store.datasets.selectedDimensions,
  selectedTimeDimensions:store.datasets.selectedTimeDimensions,
    selectedAnalysis:store.datasets.selectedAnalysis,
    signalData: store.signals.signalData,
    selectedSignal: store.signals.signalAnalysis
  };
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
handleAnlysisList(e){
  this.props.dispatch(selectedAnalysisList(e))

}
createSignal(){
  console.log(this.props);
  // if($('#createSname').val().trim() != "" || $('#createSname').val().trim() != null){
  $('body').pleaseWait();
   let analysisList =[],config={}, postData={};

  config['possibleAnalysis'] = this.props.selectedAnalysis;
  config['measures'] =this.props.selectedMeasures;
  config['dimension'] =this.props.selectedDimensions;
  config['timeDimension'] =this.props.selectedTimeDimensions;
 // alert($("#createSname").val());
 // alert($('#signalVariableList option:selected').val());
 // alert($('#signalVariableList option:selected').text());
 // alert(this.props.dataPreview.slug);

 postData["name"]=$("#createSname").val();
 postData["type"]=$('#signalVariableList option:selected').val();
 postData["target_column"]=$('#signalVariableList option:selected').text();
 postData["config"]=config;
 postData["dataset"]=this.props.dataPreview.slug;
 console.log(postData);

this.props.dispatch(createSignal(postData));
// }else{
//   $('#createSname').css("border","2px solid red");
// }


}

	render(){
     if(!$.isEmptyObject(this.props.selectedSignal)){
       console.log("move from variable selection page");
       console.log(this.props.selectedSignal)
       $('body').pleaseWait('stop');
       let _link = "/signals/"+this.props.selectedSignal.slug;
       return(<Redirect to={_link}/>)
    ;
     }

    let dataPrev = store.getState().datasets.dataPreview;
     const metaData = dataPrev.meta_data.columnData;
     let renderSelectBox = null;
    if(metaData){
      renderSelectBox =  <select className="form-control" id="signalVariableList">
      {metaData.map((metaItem,metaIndex) =>
      <option key={metaIndex} value={metaItem.columnType}>{metaItem.name}</option>
      )}
      </select>
    }else{
      renderSelectBox = <option>No Variables</option>
    }

//    const possibleAnalysis = dataPrev.meta_data.possibleAnalysis;
     const possibleAnalysis = ["Distribution Analysis","Trend Analysis", "Anova", "Regression","Decision Tree"];
        let renderPossibleAnalysis = null;
     if(possibleAnalysis){
       renderPossibleAnalysis = possibleAnalysis.map((metaItem,metaIndex) =>{
      let id = "chk_analysis"+ metaIndex;
      return(<div key={metaIndex} className="ma-checkbox inline"><input id={id} type="checkbox" className="possibleAnalysis" value={metaItem} onChange={this.handleAnlysisList.bind(this)} /><label htmlFor={id}>{metaItem}</label></div>);
      });

     }else{
       renderSelectBox = <option>No Variables</option>
     }

		return (
<div className="side-body">
      <div className="main-content">
<div className="panel panel-default">
  <div className="panel-body">

  <div className="row">
  <div className="col-lg-4">
      <div className="htmlForm-group">
           {renderSelectBox}
      </div>
  </div>{/*<!-- /.col-lg-4 -->*/}

  </div>{/*<!-- /.row -->*/}
  <br/>
 {/*  adding selection component */}
       <DataVariableSelection/>
 {/*---------end of selection component----------------------*/}
  <div className="row">
    <div className="col-md-12">
      <div className="panel panel-alt4 panel-borders">
        <div className="panel-heading text-center">PerhtmlForming the following Analysis</div>
        <div className="panel-body text-center" >
          {renderPossibleAnalysis}
        {/*  <hr/>
          <div className="pull-left">
          <div className="ma-checkbox inline"><input id="chk_results" type="checkbox" className="needsclick"/><label htmlFor="chk_results">Statistically Significant Results</label></div>
          </div>
          <div className="pull-right">
          <a href="javascript:void(0);" className="pull-right">Go to advanced settings</a>
          </div>*/}
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
      <button onClick={this.createSignal.bind(this)} className="btn btn-primary">CREATE SIGNAL</button>
    </div>
  </div>


  </div>
</div>
    </div>
</div>

		)
	}

}
