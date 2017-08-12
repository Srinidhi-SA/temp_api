import React from "react";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
import {Redirect} from 'react-router';
import store from "../../store";
@connect((store) => {
  return {login_response: store.login.login_response, dataPreview: store.datasets.dataPreview};
})

//var tableTemplate= "";
export class DataPreview extends React.Component {
  constructor(props) {
    super(props);
    console.log("checking slug");
    console.log(props);
  }
  // getPreviewData(e){
  //   this.props.dispatch(getData(e.target.id));
  // }

  render() {
    console.log("data prev is called##########3");
    console.log(this.props);
    const data = store.getState().datasets.dataPreview.meta_data.metaData;

    return (
      <div>Harman's code!!!</div>
    )

  }
}
