import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";

@connect((store) => {
    return {
        algorithmData:store.apps.regression_algorithm_data,
        manualAlgorithmData:store.apps.regression_algorithm_data_manual,
    };
})

export class TensorFlow extends React.Component {
    constructor(props) {
        super(props);
    }

    getOptions(item) {
      var arr = item.defaultValue.map(j=>j.displayName);
      var options = arr.map(k => {
          return <option value={k} > {k}</option>
      })
      return <select className="form-control"> {options} </select>
    }
    
    addLayer(){

    const div1 = document.createElement('div');
  
    div1.className = 'row layerPanel' ;
      div1.innerHTML = `
      <div class="layer">
      <div class="layerHeader">Dense</div>
      <div class="layerBody">
      <div class="form-group"><label class="col-md-2 control-label read">Activation</label><label class="col-md-4 control-label read">Activation function for the hidden layer.</label><div class="col-md-6"><div class="row undefined"><div class="col-md-6 for_multiselect"><select class="form-control single" style=""><option class="0" value="relu">relu</option><option class="1" value="identity">identity</option><option class="2" value="logistic">logistic</option><option class="3" value="tanh">tanh</option></select></div><div class="clearfix"></div><!-- react-text: 5803 --><!-- /react-text --></div></div><div class="clearfix"></div></div>
      <div class="form-group"><label class="col-md-2 control-label read">Shuffle</label><label class="col-md-4 control-label read">Activation function for the hidden layer.</label><div class="col-md-6"><div class="row undefined"><div class="col-md-6 for_multiselect"><select class="form-control single" style=""><option class="0" value="relu">relu</option><option class="1" value="identity">identity</option><option class="2" value="logistic">logistic</option><option class="3" value="tanh">tanh</option></select></div><div class="clearfix"></div><!-- react-text: 5803 --><!-- /react-text --></div></div><div class="clearfix"></div></div>
      </div>
      </div>
      `;
   
    document.getElementById('layerArea').appendChild(div1);
  }
    render() {
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
                   <input type="number" className="form-control" onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } defaultValue={item.defaultValue} value={item.defaultValue} />
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
                   <label className="col-md-4">XYZ</label>
                   <div className="col-md-6">
                 <div className ="row">
                   <div className="col-md-6">
                    {this.getOptions(this.props.manualAlgorithmData[5].parameters[0])}
                   </div>
                   <div className="col-md-6" style={{textAlign:'center'}}>
                   <div style={{cursor:'pointer',display:'inline-block'}} onClick={this.addLayer}>
                      <span className="addLayer"> <i class="fa fa-plus" style={{color: '#fff'}}></i></span>
                      <span className="addLayerTxt">Add layer</span>
                  </div>
                   </div>
                 </div>
                 </div>
                </div>
                  </div>
                  <div id="layerArea"></div>
                    {rendercontent}
                </div>
        );

    }
}
