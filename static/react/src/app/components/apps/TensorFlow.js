import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import {updateAlgorithmData} from "../../actions/appActions";
import Layer from './Layer'


@connect((store) => {
    return {
        algorithmData:store.apps.regression_algorithm_data,
        manualAlgorithmData:store.apps.regression_algorithm_data_manual,
    };
})

export class TensorFlow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          panels : [],
          layerType:"dense"
      }
    }

    changeTextboxValue(item,e){
      debugger
      var algorithmSlug="f77631ce2ab24cf78c55bb6a5fce4db8tfx";

      this.props.dispatch(updateAlgorithmData(algorithmSlug,item.name,e.target.value,"NonTuningParameter"));
  }
    handleSelectBox(item,e){
      var algorithmSlug="f77631ce2ab24cf78c55bb6a5fce4db8tfx";
      this.props.dispatch(updateAlgorithmData(algorithmSlug,item.name,e.target.value,"NonTuningParameter"));
      console.log("111111111111111111111111",item.name,e.target.value)
    }

    getOptions(item) {
      var arr = item.defaultValue.map(j=>j.displayName);
      var options = arr.map(k => {
          return <option value={k} > {k}</option>
      })
      return <select onChange={this.handleSelectBox.bind(this,item)} className="form-control"> {options} </select>
    }
    

  handleClick(){
    //apps.regression_algorithm_data_manual[5].parameters[""0""].defaultValue[1].selected

    var slectedLayer=store.getState().apps.regression_algorithm_data_manual[5].parameters[0].defaultValue.filter(i=>i.selected===true)[0].displayName;
    console.log(Layer)
    const nextId = this.state.panels.length + 1
    this.setState({
         panels: this.state.panels.concat([nextId]),
         layerType:slectedLayer
    })
  }
    render() {

      if(this.state.layerType==="Dense")
    var data=this.props.manualAlgorithmData[5].parameters[0].defaultValue[0].parameters
    else if(this.state.layerType==="Dropout")
     data=this.props.manualAlgorithmData[5].parameters[0].defaultValue[1].parameters
    else 
    data=this.props.manualAlgorithmData[5].parameters[0].defaultValue[2].parameters

     var algorithmData=this.props.manualAlgorithmData[5].parameters.filter(i=>i.name!="layer")
     var rendercontent = algorithmData.map((item,index)=>{
           if(item.paramType=="list"){
              return (
                <div className ="row mb-20">
                <div className="form-group">
                <label className="col-md-2">{item.displayName}</label>
                <label className="col-md-4">{item.description}</label>
                 <div className="col-md-6">
                 <div className ="row">
                 <div className="col-md-6">
                  {this.getOptions(item)}
                  </div>
                  </div>
                   </div>
                </div>
                </div>
              )
           }
           else
            return (
              <div className ="row mb-20">
                <div class="form-group">
                <label class="col-md-2 control-label read">{item.displayName}</label>
                <label className="col-md-4">{item.description}</label>
                <div className="col-md-6">
                 <div className ="row">
                 <div className="col-md-2">
                   <input type="number" className="form-control" onChange={this.changeTextboxValue.bind(this,item)} defaultValue={item.defaultValue} value={item.acceptedValue} />
                </div>
                </div> 
                </div>
                </div>
                </div>                
              )
       })
        return (
                <div className="col-md-12">
                  <div className="row mb-20">
                  <div class="form-group">
                   <label class="col-md-2">Layer</label>
                   <label className="col-md-4">A layer is a class implementing common Neural Networks Operations, such as convolution, batch norm, etc.</label>
                   <div className="col-md-6">
                 <div className ="row">
                   <div className="col-md-6">
                    {this.getOptions(this.props.manualAlgorithmData[5].parameters[0])}
                   </div>
                   <div className="col-md-6" style={{textAlign:'center'}}>
                   <div style={{cursor:'pointer',display:'inline-block'}} onClick={this.handleClick.bind(this,)}>
                      <span className="addLayer"> <i class="fa fa-plus" style={{color: '#fff'}}></i></span>
                      <span className="addLayerTxt">Add layer</span>
                  </div>
                  
                   </div>
                  {/* <button onClick={this.handleClick.bind(this,"dense")}>
                  <span className="addLayer"> <i class="fa fa-plus" style={{color: '#fff'}}></i></span>
                  <span className="addLayerTxt">Add layer</span>
                  </button> */}
                  
                 </div>
                 
                 </div>
                </div>
                  </div>
                  <div className='panel-wrapper'>
                  {
                    this.state.panels.map((panelId) => (
                      <Layer key={panelId} id={panelId} parameters={data} layerType={this.state.layerType} />
                    ))
                  }
                  </div>
                  <div id="layerArea"></div>
                    {rendercontent}
                </div>
        );

    }
}
