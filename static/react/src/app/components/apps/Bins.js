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
    binningOptionsOnChangeAction,
    saveBinValuesAction,
} from "../../actions/featureEngineeringActions";
@connect((store) => {
return {
login_response: store.login.login_response,
selectedItem: store.datasets.selectedItem,
dataPreview:store.datasets.dataPreview,
isNoOfBinsEnabled:store.datasets.isNoOfBinsEnabled,
isSpecifyIntervalsEnabled:store.datasets.isSpecifyIntervalsEnabled
};
})
export class Bins extends React.Component {
constructor(props) {
  super(props);
  this.state = {}
  this.pickValue = this.pickValue.bind(this);
          console.log("Bins constructor method is called...");
}
componentWillMount() {
console.log("Bins componentWillMount method is called...");
  }


  binningOptionsOnChange(event){
    var selectedValue = event.target.value;

      if(selectedValue == "create_equal_sized_bins"){
        this.props.dispatch(binningOptionsOnChangeAction(false, true));
      }else if(selectedValue == "create_custom_bins"){
        this.props.dispatch(binningOptionsOnChangeAction(true, false));
      }
  this.pickValue(event);
  }
  pickValue(event){
    this.props.parentPickValue("binData", event);
  }


render() {

  console.log("Bins render method is called...");

   var binningOptions="";
   var bins = "";
   var measure = this.props.dataPreview.meta_data.uiMetaData.fe_config.fe.measure;
binningOptions=
  (measure.level_creation_settings.operations.map(item=>{
    if(item.display){
        return(
          <option  key={item.name} value={item.name}  >{item.displayName}</option>);
      }

}))







  bins =
  (<Tab.Pane>
    <div className="row form-group">
  <label for="sel_tobg" className="col-sm-4 control-label">{"Column name"}</label>
  <div className="col-sm-8">
  <input type="text" title="Please Enter " name="name" value={this.props.selectedItem.name} disabled className="form-control" />
</div>
  </div>
  <div className="row form-group">
                    <label for="sel_tobg" className="col-sm-4 control-label">{"Type of binning"}</label>
                    <div className="col-sm-8">
                        <select name="selectBinType" class="form-control" onChange={this.binningOptionsOnChange.bind(this)}>
                          {binningOptions}
                        </select>
                    </div>
                              </div>
              <div className="row form-group">
                    <label for="sel_tobg" className="col-sm-4 control-label">{"Number of bins"}</label>
                      <div className="col-sm-8">
                        <input type="text" title="Please Enter " name="numberofbins" value=""  disabled={this.props.isNoOfBinsEnabled} onInput={this.pickValue}  className="form-control" />
                      </div>
              </div>
                    <div className="row form-group">
                      <label for="sel_to bg" className="col-sm-4 control-label">{"Specify intervals"}</label>
                      <div className="col-sm-8">
                        <input type="text" title="Please Enter " name="specifyintervals" disabled={this.props.isSpecifyIntervalsEnabled} className="form-control" onInput={this.pickValue} />
                      </div>
                    </div>
                    <div className="row form-group">
                      <label for="sel_tobg" className="col-sm-4 control-label">{"New column name"}</label>
                      <div className="col-sm-8">
                        <input type="text" title="Please Enter " name="newcolumnname" className="form-control" onInput={this.pickValue} />
                        </div>
                      </div>
                    </Tab.Pane>
        )



      return (
        <div>
          <Tab.Container id="left-tabs-example">
        <Row className="clearfix">
        <Col sm={15}>
    <Tab.Content animation>
      {bins}
    </Tab.Content>
  </Col>
  </Row>
  </Tab.Container>
  </div>
  );

  }


}
