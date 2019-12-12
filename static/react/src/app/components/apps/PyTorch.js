import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import {statusMessages} from  "../../helpers/helper"
import { RegressionParameter } from "./RegressionParameter";

@connect((store)=>{
    return{
        algorithmData:store.apps.regression_algorithm_data,
        manualAlgorithmData:store.apps.regression_algorithm_data_manual,
    }
})

export class PyTorch extends React.Component {
    constructor(props){
        super(props);
    }
    render() {
        let renderPyTorchContent = "Pytorch"
        let pyTochData = this.props.algorithmData.filter(i=>i.algorithmName === "PyTorch")[0];
        renderPyTorchContent = pyTochData.parameters.map((pydata,index) =>{
            if(pydata.display){
                return(

                    <div class="form-group">
                        <label class="col-md-2 control-label read">{pydata.displayName}</label>
                        <label class="col-md-4 control-label read">{pydata.description}</label>
                        <RegressionParameter parameterData={pydata} /*tuneName={selectedValue}*/ algorithmSlug={pyTochData.algorithmSlug} type="TuningParameter"/>
                    <div class="clearfix"></div> 
                    </div>

                );
            }
        });
        return (        
            <div className="col-md-12">
                <div className="row mb-20">
                    <div class="form-group">
                        {renderPyTorchContent}
                    </div>
                </div>
          </div>
        );

    }
}
