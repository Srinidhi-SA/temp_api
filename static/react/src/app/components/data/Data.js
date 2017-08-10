import React from "react";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
import {Redirect} from 'react-router';
import {getData} from "../../actions/dataActions";
import store from "../../store";
@connect((store) => {
  return {login_response: store.login.login_response,
           dataPreview: store.data.dataPreview};
})

export class Data extends React.Component {
  constructor(props) {
   super(props);
   console.log("checking slug");
   console.log(props);
 }
 getPreviewData(e){
   this.props.dispatch(getData(e.target.id));

 }
 // showPreview(){
 //   this.props.history.push("/data/test_dataset6-t6iy9qzk3k");
 // }

  render() {
    console.log("data is called##########3");
    console.log(this.props);
    const data = store.getState().data.dataPreview;
    if(data){
     return(<Redirect to="/data/test_dataset6-t6iy9qzk3k"/>);
   }

    return (
        <div>
          <div className="side-body">
          {  /*<MainHeader/>*/}
            <div className="main-content">
              Data is called!!!!!
              <button id="test_dataset6-t6iy9qzk3k" onClick={this.getPreviewData.bind(this)}>Data file 1</button>
            </div>
          </div>
        </div>
      );
  }
}
