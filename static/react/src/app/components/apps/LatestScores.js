
import React from "react";
import {connect} from "react-redux";
import {ScoreCard}  from "./ScoreCard";

 
@connect((store) => {
    return {login_response: store.login.login_response,
        latestScores: store.apps.latestScores};
})

export class LatestScores extends React.Component {
    constructor(props) {
        super(props);
        this.props=props;
    }
    
    componentWillMount(){
        
    }
    
    render() {
        var data = this.props.latestScores;
  var latestScores = "";
        if(data){
            latestScores =  <ScoreCard match = {this.props.props.match} data={data}/>;
        }
        return (
                <div class="dashboard_head">
                <div class="active_copy apps-cards">
                <div class="row">
                {latestScores}
                </div>
                </div>
                </div>
                
        );
    }
    
}
