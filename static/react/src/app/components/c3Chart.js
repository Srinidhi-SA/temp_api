import React from "react";
import {connect} from "react-redux";
import {c3Functions} from "../helpers/c3.functions";

var data= {};
export class C3Chart extends React.Component {
  constructor(props) {
    super(props);
    console.log("yformat55555555555555");
    console.log(props);
  }
  getChartElement(){
      return $(".chart", this.element);
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

  data['bindto'] = this.getChartElement().get(0); // binding chart to html element
  console.log(data);
   const chart = c3.generate(data);
  }

  render() {
      return(
                        <div class="chart col-md-8 col-md-offset-2 col-sm-8 col-sm-offset-2"></div>
      );
  }
}
