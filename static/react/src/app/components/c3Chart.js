import React from "react";
import {connect} from "react-redux";
import {c3Functions} from "../helpers/c3.functions";




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
	if($(".chart"+props.classId).html()){
		this.updateChart();
	}
	
	this.classId = "chart"+this.props.classId + " ct col-md-8 col-md-offset-2 col-sm-8 col-sm-offset-2 xs-mb-20";
  }
  getChartElement(){
	  if(this.props.classId=='_side'){
		  return $(".chart", this.element);
	  }
      return $(".chart"+this.props.classId, this.element);
    }
componentWillMount(){
	console.log("chart store object::::");
	console.log(this.props.chartObject);

		this.updateChart();
		
		  if(this.props.classId =='_side'){
         this.classId = "chart col-md-12";
       }

}
  componentDidMount() {
	
    this.updateChart();
  }
  
  
  updateChart() {

    let data = this.props.data;
     if(this.props.sideChart){
       data['size']= {
          height: 200
       }
     }
    if(this.props.yformat){
    if(this.props.yformat=='m'){
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
    }
  }

  if(this.props.y2format){
  if(this.props.y2format=='m'){
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
  }
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
  }


  render() {
	  this.updateChart();
	  
     //var classId = "chart"+this.props.classId + " ct col-md-8 col-md-offset-2 col-sm-8 col-sm-offset-2 xs-mb-20";
	  
      return(
                        <div class={this.classId}></div>
      );
  }
}
