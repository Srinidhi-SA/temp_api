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

    render() {
        return (
                <div class="col-md-6">
                    Tensor Component
                </div>
        );

    }
}
