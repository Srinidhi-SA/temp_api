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
    console.log("data is called##########3");
    console.log(this.props);
    const data = store.getState().data.dataPreview.meta_data.data;

    if (data) {
      const tableThTemplate=data[0].map((thElement, thIndex) => {
          return(
            <th key={thIndex}>
                {thElement}
            </th>
          );
      });
      data.splice(0,1);
     const tableRowsTemplate = data.map((trElement, trIndex) => {

         const tds=trElement.map((tdElement, tdIndex) => {
              return(
                 <td key={tdIndex}>{tdElement}</td>
               );
           });
          return (
           <tr key={trIndex}>
               {tds}
           </tr>

      );
    });
    return (
<div className="side-body">
<div className="main-content">
      <table>
        <thead>
          <tr>
             {tableThTemplate}
          </tr>
        </thead>
        <tbody>
             {tableRowsTemplate}
        </tbody>

      </table>
    </div>
    </div>
    );
    } else {
      return (
        <div>no signals</div>
      )
  }
}
}
