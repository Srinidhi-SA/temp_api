import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import {statusMessages} from  "../../helpers/helper"

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
        this.props.algorithmData
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
