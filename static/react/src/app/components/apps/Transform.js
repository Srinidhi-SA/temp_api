import React from "react";
import { connect } from "react-redux";
import { Scrollbars } from 'react-custom-scrollbars';
import { Button, Dropdown, Menu, MenuItem, Modal, Nav, NavItem, Tab, Row, Col } from "react-bootstrap";
import {
  openBinsOrLevelsModalAction,
  closeBinsOrLevelsModalAction,
  openTransformColumnModalAction,
  closeTransformColumnModalAction,
  selectedBinsOrLevelsTabAction,
} from "../../actions/dataActions";

@connect((store) => {
  return {
    login_response: store.login.login_response,
    dataPreview: store.datasets.dataPreview,
    selectedItem: store.datasets.selectedItem,
  };
})

export class Transform extends React.Component {
  constructor(props) {
    super(props);
    console.log("Transform constructor method is called...");
    this.pickValue = this.pickValue.bind(this);

  }

  componentWillMount() {
    console.log("Transform componentWillMount method is called...");
  }

  pickValue(event){
    this.props.parentPickValue("transformationData", event);
  }

  render() {
    console.log("Transforms render method is called...");
    var transformHtml = this.props.dataPreview.meta_data.uiMetaData.fe_config.fe;

    var mtransform = transformHtml.measure.transformation_settings.operations.map(item => {
      if(item.display){

      var replacevalue = (
        <div>
        <div class="col-md-3 col-sm-3">
          <input type="text" id="txt_qnt1" name="repaceWithValue" onInput={this.pickValue} class="form-control" placeholder="Value" />
        </div>
        <label for="txt_qValue1" class="col-md-1 col-sm-1 control-label xs-p-0 xs-mt-5 text-right">With</label>
        <div class="col-md-3 col-sm-3">
          <select class="form-control" id="txt_qValue1">
            <option>Mean</option>
            <option>Median</option>
            <option>Mode</option>
          </select>
        </div>
      </div>)

        return (
          <div class="ma-checkbox inline">
            <input id={item.name} name={item.name} type="checkbox" class="needsclick" onInput={this.pickValue} onChange={this.pickValue}/>
            <label for={item.name}>{item.displayName}:</label>
          </div>
        );
      }
      else{
        return "";
      }
    })

    var dtransform = transformHtml.dimension.transformation_settings.operations.map(item => {
      if(item.display){
        return (
          <div class="ma-checkbox inline">
            <input id={item.name} type="checkbox" class="needsclick"/>
            <label for={item.name}>{item.displayName}:</label>
          </div>
        );
      }
      else{
      return "";
    }
    })

    if(this.props.selectedItem.columnType == "measure"){
      return (
          <div class="modal-body">
            <h4>What would you like to do with {this.props.selectedItem.name} column?</h4>
            <p>Please select any of the options provided below that will help in transforming the chosen column into multiple new features.
              Each option will create an additional feature derived out of the original column.</p>
            <hr/>
            {/* <!-- content goes here --> */}
            <form class="form_withrowlabels">
              <div class="row form-group">
                <div class="col-md-5 col-sm-5">
                    {mtransform}
                </div>
              </div>
            </form>
          </div>
      );
    }
    else if(this.props.selectedItem.columnType == "dimension"){
      return (
        <div class="modal-body">
          <h4>What would you like to do with {this.props.selectedItem.name} column?</h4>
          <p>Please select any of the options provided below that will help in transforming the chosen column into multiple new features.
            Each option will create an additional feature derived out of the original column.</p>
          <hr />
          {/* <!-- content goes here --> */}
          <form class="form_withrowlabels">
            <div class="row form-group">
              <div class="col-md-6 col-sm-6">
                <div class="ma-checkbox inline">
                  <label for="state_chk1">{dtransform}</label>
                </div>
              </div>
            </div>
          </form>
        </div>
      );
    }
    else{
      return "";
      // (
      //   <div class="modal-body">
      //     <div class="xs-m-20"></div>
      //     {/* <!-- content goes here --> */}
      //     <form class="form_withrowlabels form-inline">
      //       <div class="form-group">
      //         <label for="txt_lName3">1</label>
      //         <input type="text" id="txt_lName3" class="form-control" placeholder="Level Name" value="Q1 2012" />
      //       </div>
      //       <div class="form-group">
      //         <label for="txt_sPeriod">&nbsp;&nbsp;&nbsp; Start period:</label>
      //         <input type="text" id="txt_sPeriod" class="form-control" placeholder="Start Date" value="01/01/2012" />
      //       </div>
      //       <div class="form-group">
      //         <label for="txt_ePeriod">&nbsp;&nbsp;&nbsp; End period:</label>
      //         <input type="text" id="txt_ePeriod" class="form-control" placeholder="End Date" value="03/31/2012" />
      //       </div>
      //       <button class="btn btn-default b-inline"><i class="fa fa-close"></i></button>
      //       <div class="clearfix"></div>
      //       <div class="form-group">
      //         <label for="txt_lName1">2</label>
      //         <input type="text" id="txt_lName1" class="form-control" placeholder="Level Name" value="Q1 2012" />
      //       </div>
      //       <div class="form-group">
      //         <label for="txt_sPeriod1">&nbsp;&nbsp;&nbsp; Start period:</label>
      //         <input type="text" id="txt_sPeriod1" class="form-control" placeholder="Start Date" value="01/01/2012" />
      //       </div>
      //       <div class="form-group">
      //         <label for="txt_ePeriod1">&nbsp;&nbsp;&nbsp; End period:</label>
      //         <input type="text" id="txt_ePeriod1" class="form-control" placeholder="End Date" value="03/31/2012" />
      //       </div>
      //       <button class="btn btn-primary b-inline"><i class="fa fa-plus"></i></button>
      //     </form>
      //   </div>
      // );
    }

    return (
      <div>
        <Tab.Container id="left-tabs-example">
          <Row className="clearfix">
            <Col sm={15}>
              <Tab.Content animation>{mtransform}</Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    );
  }
}
