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
    

    render() {
     var algorithmData=this.props.manualAlgorithmData[5].parameters
     var rendercontent = algorithmData.map((item,index)=>{
           if(item.paramType=="list"){
              return (
                <div class="form-group">
                <label class="col-md-4 control-label read">{item.displayName}</label>
                 <div className="col-md-6 for_multiselect">
                  {this.getOptions(item)}
                   </div>
                 <div class="clearfix"></div>
                </div>
              )
           }
           else
            return (
                <div class="form-group">
                <label class="col-md-4 control-label read">{item.displayName}</label>
                 <div className="col-md-2">
                   <input type="number" className="form-control" onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } defaultValue={item.defaultValue} value={item.defaultValue} />
                   </div>
                 <div class="clearfix"></div>
                </div>                 
              )
       })
        return (
                <div class="col-md-6">
                    {rendercontent}
                </div>
        );

    }
}
