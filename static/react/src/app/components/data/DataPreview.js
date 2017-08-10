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
      console.log(data[0]);
      const tableThTemplate=data[0].map((thElement, thIndex) => {
          return(
            <th key={thIndex} className="dropdown">
            <a href="#" data-toggle="dropdown" className="dropdown-toggle"><i className="fa fa-clock-o"></i> {thElement}</a>
            {/*<ul className="dropdown-menu">
               <li><a href="#">Ascending</a></li>
               <li><a href="#">Descending</a></li>
               <li><a href="#">Measures</a></li>
               <li><a href="#">Dimensions</a></li>
            </ul>*/}

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
//     return (
// <div classNameName="side-body">
// <div classNameName="main-content">
//       <table>
//         <thead>
//           <tr>
//              {tableThTemplate}
//           </tr>
//         </thead>
//         <tbody>
//              {tableRowsTemplate}
//         </tbody>
//
//       </table>
//     </div>
//     </div>
//     );
return(
  <div className="side-body">
    {/* <!-- Page Title and Breadcrumbs -->*/}
     <div className="page-head">
        <div className="row">
           <div className="col-md-8">
              <h2>Data Preview</h2>
           </div>
        </div>
        <div className="clearfix"></div>
     </div>
    { /*<!-- /.Page Title and Breadcrumbs -->*/ }
    { /*<!-- Page Content Area -->*/}
     <div className="main-content">
        <div className="row">
           <div className="col-md-9">
              <div className="panel panel-borders">
                 <div className="col-md-3 col-xs-6">
                    <h3>
                       2500
                       <small>Rows</small>
                    </h3>
                 </div>
                 <div className="col-md-3 col-xs-6">
                    <h3>
                       30
                       <small>Columns</small>
                    </h3>
                 </div>
                 <div className="col-md-3 col-xs-6">
                    <h3>
                       15
                       <small>Measures</small>
                    </h3>
                 </div>
                 <div className="col-md-3 col-xs-6">
                    <h3>
                       9
                       <small>Dimensions</small>
                    </h3>
                 </div>
                 <div className="clearfix"></div>
                 <div className="table-responsive noSwipe">
                 <table className="table table-condensed table-hover table-bordered table-striped cst_table">
                          <thead>
                            <tr>
                               {tableThTemplate}
                            </tr>
                         </thead>
                         <tbody className="no-border-x">
                               {tableRowsTemplate}
                         </tbody>

                        </table>
                 </div>
              </div>
           </div>
           <div className="col-md-3 preview_stats">
  { /*<!-- Start Tab Statistics -->*/}
              <div id="tab_statistics" className="panel-group accordion accordion-semi">
                 <div className="panel panel-default">
                    <div className="panel-heading">
                       <h4 className="panel-title"><a data-toggle="collapse" data-parent="#tab_statistics" href="#pnl_stc" aria-expanded="true" className="">Statistics <i className="fa fa-angle-down pull-right"></i></a></h4>
                    </div>
                    <div id="pnl_stc" className="panel-collapse collapse in" aria-expanded="true">
                       <div className="panel-body">
                          <table className="no-border no-strip skills">
                             <tbody className="no-border-x no-border-y">
                                <tr>
                                   <td className="item">Mean: </td>
                                   <td>0.2166</td>
                                </tr>
                                <tr>
                                   <td className="item">Median: </td>
                                   <td>0</td>
                                </tr>
                                <tr>
                                   <td className="item">Min: </td>
                                   <td>0</td>
                                </tr>
                                <tr>
                                   <td className="item">Max: </td>
                                   <td>1</td>
                                </tr>
                                <tr>
                                   <td className="item">Standard Deviation: </td>
                                   <td> 0.4119</td>
                                </tr>
                             </tbody>
                          </table>
                       </div>
                    </div>
                 </div>
              </div>
  {  /*<!-- ./ End Tab Statistics -->*/}
  { /* <!-- Start Tab Visualizations -->*/}
              <div id="tab_visualizations" className="panel-group accordion accordion-semi">
                 <div className="panel panel-default">
                    <div className="panel-heading">
                       <h4 className="panel-title"><a data-toggle="collapse" data-parent="#tab_visualizations" href="#pnl_visl" aria-expanded="true" className="">Visualizations <i className="fa fa-angle-down pull-right"></i></a></h4>
                    </div>
                    <div id="pnl_visl" className="panel-collapse collapse in" aria-expanded="true">
                       <div className="panel-body">
                          <img src="../assets/images/data_preview_graph.png" className="img-responsive" />
                       </div>
                    </div>
                 </div>
              </div>
    {/*<!-- ./ End Tab Visualizations -->*/}

    {/*<!-- Start Tab Subsettings - ->*/}
    {/*<div id="tab_subsettings" className="panel-group accordion accordion-semi">
                 <div className="panel panel-default">
                    <div className="panel-heading">
                       <h4 className="panel-title"><a data-toggle="collapse" data-parent="#tab_subsettings" href="#pnl_tbset" aria-expanded="true" className="">Sub Setting <i className="fa fa-angle-down pull-right"></i></a></h4>
                    </div>
                    <div id="pnl_tbset" className="panel-collapse collapse in" aria-expanded="true">
                       <div className="panel-body">
                       <div className="row">
                          <div className="col-xs-4">
                             <input type="text" className="form-control" id="from_value" value="0" />
                          </div>
                          <div className="col-xs-3">
                             <label>To</label>
                          </div>
                          <div className="col-xs-4">
                             <input type="text" className="form-control" id="to_value" value="10" />
                          </div>
                       </div>
                       <div className="form-group">
                          <input type="text" data-slider-value="[250,450]" data-slider-step="5" data-slider-max="1000" data-slider-min="10" value="" className="bslider form-control"/>
                       </div>
                    </div>
                    </div>
                 </div>
              </div>*/}
    {/*<!-- ./ End Tab Subsettings -->*/}
           </div>
        </div>
     </div>
     {/*<!-- /.Page Content Area --> */}
  </div>
);
    } else {
      return (
        <div>no data</div>
      )
  }
}
}
