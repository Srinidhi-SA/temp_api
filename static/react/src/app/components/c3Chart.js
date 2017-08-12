import React from "react";
import {connect} from "react-redux";
import {c3Functions} from "../helpers/c3.functions";

var data= {}, toolData = [], toolLegend=[], chartDiv =null;
export class C3Chart extends React.Component {
  constructor(props) {
    super(props);
    console.log("yformat55555555555555");
    console.log(props);
  }
  getChartElement(){
      return $(".chart", this.element);
    }
componentWillMount(){
  if(this.props.sideChart){
  //  $(".chart").removeClass("col-md-8 col-md-offset-2 col-sm-8 col-sm-offset-2").addClass("col-md-12");
   chartDiv = <div class="chart col-md-12"></div>
}else{
   chartDiv = <div class="chart col-md-8 col-md-offset-2 col-sm-8 col-sm-offset-2"></div>
}
}
  componentDidMount() {
    this.updateChart();

  }
  // componentDidUpdate() {
  //   this.updateChart();
  // }
  updateChart() {
    let data = this.props.data;

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
  //console.log("tooltip");
  //console.log(tooltip);
  window.toolData =[];
  window.toolData.push(tooltip[0]);
  window.toolData.push(tooltip[1]);
  window.toolLegend= tooltip[2];
  //window.tooltipFunc = data.tooltip.contents;
  //console.log(data.tooltip.show)
  data.tooltip.contents = c3Functions.set_tooltip;
  //console.log(data.tooltip.contents)
  console.log(data.tooltip.contents);
}
  data['bindto'] = this.getChartElement().get(0); // binding chart to html element
  console.log(data);
   const chart = c3.generate(data);
  }


  render() {
      return(
        <div>
                  {chartDiv}
        </div>      
      );
  }
}
