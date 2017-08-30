import React from "react";
import {connect} from "react-redux";
import {c3Functions} from "../helpers/c3.functions";
import { Scrollbars } from 'react-custom-scrollbars';
import {API} from "../helpers/env";


//var data= {}, toolData = [], toolLegend=[], chartDiv =null;
export class C3Chart extends React.Component {
  constructor(props) {
	  
    super(props);
    console.log("yformat55555555555555");
    console.log(props);
    //this.data ={};
	//this.toolData = [];
	//this.toolLegend =[];
	//this.chartDiv = null;
	this.tableDownload = "";
	this.modalCls = "modal fade chart-modal"+props.classId;
	 this.tableCls = "table-responsive table-area table"+props.classId;
	if($(".chart"+props.classId).html()){
		this.updateChart();
	}
	
	this.classId = "chart"+this.props.classId + " ct col-md-8 col-md-offset-2 col-sm-8 col-sm-offset-1 xs-mb-20";
	//col-md-8 col-md-offset-1 col-sm-8 col-sm-offset-1 xs-mb-20";
  }
  
  getChartElement(){
	  if(this.props.classId=='_side'){
		  return $(".chart", this.element);
	  }
      return $(".chart"+this.props.classId, this.element);
    }
	
	closeModal(){ //closing the modal
		$(".chart-modal"+this.props.classId).modal('hide');
	}  
	 showModal(){// showing the modal
		$(".chart-modal"+this.props.classId).modal({ keyboard: true,show: true });
	 }
	
   componentWillMount(){
	console.log("chart store object::::");
	console.log(this.props.chartObject);

		this.updateChart();
		
		  if(this.props.classId =='_side'){
            this.classId = "chart";
		    

       }

}
  componentDidMount() {
	
    this.updateChart();
	$('.chart-data-icon').css('visibility','hidden');
  }
  
  
  updateChart() {
	  var that = this;
    let data = this.props.data;
     if(this.props.sideChart){
       data['size']= {
          height: 200
       }
     }
    if(this.props.yformat){
	let formats= ['.2s','$','$,.2s','.2f'];
		if(formats.indexOf(this.props.yformat) >= 0){
			data.axis.y.tick.format = d3.format(this.props.yformat);
		}else{
			data.axis.y.tick.format = d3.format('');
		}
		
	if(this.props.tabledownload){
		this.tableDownload = API + this.props.tabledownload;
		
	}
	
   /* if(this.props.yformat=='m'){
      //console.log(this.props.yformat);
      data.axis.y.tick.format = d3.format('.2s');
    }else  if(this.props.yformat=='$'){
      //console.log(this.props.yformat);
      data.axis.y.tick.format = d3.format('$');
    }else  if(this.props.yformat=='$m'){
     // console.log(this.props.yformat);
      data.axis.y.tick.format = d3.format('$,.2s');
    }else  if(this.props.yformat=='f'){
     // console.log(this.props.yformat);
      data.axis.y.tick.format = d3.format('.2f');
    }*/
  }

  if(this.props.y2format){
	  let formats= ['.2s','$','$,.2s','.2f'];
		if(formats.indexOf(this.props.y2format) >= 0){
			data.axis.y2.tick.format = d3.format(this.props.y2format);
		}else{
			data.axis.y2.tick.format = d3.format('');
		}
		
  /*if(this.props.y2format=='m'){
    //console.log(this.get('y2format'));
    data.axis.y2.tick.format = d3.format('.2s');
  }else  if(this.props.y2format=='$'){
    //console.log(this.get('y2format'));
    data.axis.y2.tick.format = d3.format('$');
  }else  if(this.props.y2format=='$m'){
    //console.log(this.get('y2format'));
    data.axis.y2.tick.format = d3.format('$,.2s');
  }else  if(this.props.y2format =='f'){
    //console.log(this.get('yformat'));
    data.axis.y.tick.format = d3.format('.2f');
  }*/
}

if(this.props.tooltip){
  //alert("working");
  var tooltip = this.props.tooltip;
  
  window.toolData =[];
  window.toolData.push(tooltip[0]);
  window.toolData.push(tooltip[1]);
  window.toolLegend= tooltip[2];
  
  
  //window.tooltipFunc = data.tooltip.contents;
  
  data.tooltip.contents = c3Functions.set_tooltip;
 
  console.log(data.tooltip.contents);
}
  data['bindto'] = this.getChartElement().get(0); // binding chart to html element
  console.log(data);

   let chart = c3.generate(data);
      chart.destroy();
	  chart = c3.generate(data);
   
    //this.props.dispatch(chartObjStore(chart));
	
	//------------ popup setup------------------------------------------------
	$('.chart-area').mouseenter(function(){
		if(that.props.classId != '_side'){
		 $('.chart-data-icon').css('visibility','visible');
		}
	}).mouseleave(function(){
		 $('.chart-data-icon').css('visibility','hidden');
	});
	if(this.props.tabledata){
         var tabledata = this.props.tabledata;
		 console.log("table data");
	     console.log(tabledata);
		  
		 var collength = tabledata.length;
		 console.log(collength);
		 var rowlength = tabledata[0].length;
		 var tablehtml  = "<thead><tr>", tablehead ="",  tablebody="";
		 for(var i=0; i<collength;i++){
			 tablehtml += "<th> <b>" + tabledata[i][0] +"</b></th>";
		 }
		   tablehtml += "</tr></thead><tbody>";

			 for(var j=1; j<rowlength;j++){
				 tablehtml +="<tr>";
				 for(var k=0; k<collength;k++){
			 tablehtml += "<td>" + tabledata[k][j] +"</td>"
			 }
			 tablehtml +="</tr>";
		 }
		 tablehtml += "</tbody></table>";

		$(".table"+this.props.classId +" table").html(tablehtml);
	}
	
	//-----popup setup end------------------------------------------------
	
  }


  render() {
	  var that = this;
	  $(function(){
		  that.updateChart();
	  });
	  
	  
     //var classId = "chart"+this.props.classId + " ct col-md-8 col-md-offset-2 col-sm-8 col-sm-offset-2 xs-mb-20";
	  
      return(
<div className="chart-area">
  <div className="row">
  	<div className="chart-data-icon col-md-9 col-md-offset-1">
         <i className="fa fa-cloud-download" aria-hidden="true" onClick={this.showModal.bind(this)}></i>
     </div>
	 <div className="clearfix"></div>
  </div>
    <div className="row">
		   <div className={this.classId}></div>
		   <div className="clearfix"></div>
     </div>
		   {/* chart data Popup */}
		   <div id="" className={this.modalCls} role="dialog">
		   <div className="modal-dialog ">
  
		   {/*Modal content*/}
			<div className="modal-content chart-data-popup">
			   <div className="modal-body chart-data-modal-body">
			  <p className="chart-data-title">Chart Data</p>
			   <button type='button' onClick={this.closeModal.bind(this)} className='close chart-data-close'  data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>

		  </div>
		  <br/>
		  
		  <div className="row" >
			<div className="col-md-12">
			 <div className={this.tableCls}>
			  <Scrollbars>
			   <table className='table chart-table'>
			   </table>
			  {/*<div class="form-group col-md-7;">*/}
			   </Scrollbars>
			   </div>
			</div>
		   </div> 

		   <div className="chart-data-download">
			  <a href={this.tableDownload} id="cddownload" className="btn btn-primary" download >Download Chart Data</a>
		   </div>



		   </div>
		  </div>
		 </div>

 </div>
 
      );
  }
}
