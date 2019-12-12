import React, { Component } from 'react'
import { Button, } from "react-bootstrap";
import {addLayersTensorFlow,updateTensorFlowArray,addTensorFlowArray} from '../../actions/appActions'
import store from "../../store";
import { connect } from "react-redux";



@connect((store) => {
	return {
    login_response: store.login.login_response, 
		};
})

export default class Layer extends Component {
  

  // constructor(props) {
    // super(props);
    // if(this.props.layerType=="Dense")
    //  this.state={
    // "layer":"Dense",
    // "activation": "deserialize",
    // "activity_regularizer": "l1",
    // "bias_constraint": "MaxNorm",
    // "bias_initializer": "Zeros",
    // "bias_regularizer": "l1",
    // "kernel_constraint": "MaxNorm",
    // "kernel_initializer": "Zeros",
    // "kernel_regularizer": "l2",
    // "units": "0",
    // "use_bias": "False",
      // }
      // else if(this.props.layerType=="Dropout")
      // this.state={
        // "layer":"Dropout",
        // "rate":"0.2",
      // }
      // else
      // this.state={
      //   "layer":"Lambda",
        // "function":"2*x",
      // }

    // }

    componentDidMount(){
      this.props.dispatch(addTensorFlowArray(this.props.id,this.props.layerType))
    }
    
    shouldComponentUpdate(nextProps){
       return false
  }
  
  myChangeHandler(item,e){
    let name = item.name;
    let val = e.target.value;
    // this.setState({[name]: val},()=>{
    // });
    this.props.dispatch(updateTensorFlowArray(this.props.id,name,val))
  }
  getOptions(item) {
    var arr = item.defaultValue.map(j=>j.displayName);
    var optionsHtml = arr.map(k => {
        return <option value={k} > {k}</option>
    })
    return <select className="form-control" onChange={this.myChangeHandler.bind(this,item)}>{optionsHtml} </select>
  }
  
    
  handleSaveClick=()=>{ //not using this function as well as save button
    this.props.dispatch(updateTensorFlowArray(this.props.id,this.state.layer,this.state))
  }
  
  handleSelectBox(item,e){ //not using this function
    debugger;
    alert(e.target.value);
    console.log("111111111111111111111111",item.name,e.target.value)
  }
  

  render() {

     
    var cls =`row layerPanel ${this.props.id}`
    debugger;
    var rendercontent = this.props.parameters.map((item,index)=>{
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
                   <input type="number" className="form-control"  name={item.name} onChange={this.myChangeHandler.bind(this,item)}></input>
                   </div>
                </div> 
                </div>
                </div>
                </div>
                    
                )
   
         })
   
    return ( 
      <div className={cls}>
      <div class="laye">
      <div class="layerHeader">
      {this.props.layerType}
      </div>
      <div class="layerBody">
        {rendercontent}
        {/* <div className="row">
        <div className="col-md-12 text-center">
         <Button  bsStyle="primary" onClick={this.handleSaveClick}>{this.state.isSaved?"saved":"save"}</Button>
        </div>
        </div> */}
        </div>
      </div>
      </div>
    )
  }
}
