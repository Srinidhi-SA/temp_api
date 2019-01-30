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
isSpecifyIntervalsEnabled:store.datasets.isSpecifyIntervalsEnabled,
featureEngineering:store.datasets.featureEngineering
};
})
export class Bins extends React.Component {
  constructor(props) {
    super(props);
    this.pickValue = this.pickValue.bind(this);
  }

getBindata(){
  if(this.props.featureEngineering != undefined || this.props.featureEngineering !=null){
  var slugData = this.props.featureEngineering[this.props.selectedItem.slug];
    if(slugData != undefined && slugData.binData != undefined){
      return JSON.parse(JSON.stringify(slugData.binData));;
    }
  }
  return {};
}

  getbinningOptions(){

    var binData= this.getBindata();
    var measure = this.props.dataPreview.meta_data.uiMetaData.fe_config.fe.measure;
    var binningOptions =  (measure.level_creation_settings.operations.map(item =>
        <option  key={item.name} value={item.name}  >{item.displayName}</option>))
      return (<select className="form-control" name="selectBinType" value={binData.selectBinType}  onChange={this.binningOptionsOnChange.bind(this)}>{binningOptions}</select>);

  }



  binningOptionsOnChange(event){
    var selectedValue = event.target.value;

    //var binData = this.getBindata();

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


onchangeInput(event){
  return event.target.value;
}

render() {

  console.log("Bins render method is called...");

   var bins = "";
   var binData= this.getBindata();

  bins =
<<<<<<< HEAD
  (
    <Tab.Pane>
      <div className="row form-group">
        <label for="sel_tobg" className="col-sm-4 control-label">{"Column name"}</label>
        <div className="col-sm-8">
          <input type="text" title="Please Enter " name="name" value={this.props.selectedItem.name} disabled className="form-control" />
        </div>
      </div>
      <div className="row form-group">
        <label for="sel_tobg" className="col-sm-4 control-label">{"Type of binning"}</label>
        <div className="col-sm-8">
          {this.getbinningOptions()}
        </div>
      </div>
      <div className="row form-group">
        <label for="sel_tobg" className="col-sm-4 control-label">{"Number of bins"}</label>
        <div className="col-sm-8">
          <input type="number" title="Please Enter " name="numberofbins" min="1" defaultValue={binData.numberofbins} disabled={this.props.isNoOfBinsEnabled} onInput={this.pickValue}  onChange={this.onchangeInput.bind(this)} className="form-control" />
        </div>
      </div>
      <div className="row form-group">
        <label for="sel_to bg" className="col-sm-4 control-label">{"Specify intervals"}</label>
        <div className="col-sm-8">
          <input type="text" title="Please Enter " name="specifyintervals"   defaultValue={binData.specifyintervals} disabled={this.props.isSpecifyIntervalsEnabled} onChange={this.onchangeInput.bind(this)} className="form-control" onInput={this.pickValue} />
        </div>
      </div>
      <div className="row form-group">
        <label for="sel_tobg" className="col-sm-4 control-label">{"New column name"}</label>
        <div className="col-sm-8">
          <input type="text" title="Please Enter " name="newcolumnname"  defaultValue={binData.newcolumnname} onChange={this.onchangeInput.bind(this)}   className="form-control" onInput={this.pickValue} required="required"/>
        </div>
      </div>
    </Tab.Pane>
  )
=======
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
                      {this.getbinningOptions()}
                    </div>
                              </div>
              <div className="row form-group">
                    <label for="sel_tobg" className="col-sm-4 control-label">{"Number of bins"}</label>
                      <div className="col-sm-8">
                        <input type="text" title="Please Enter " name="numberofbins"  defaultValue={binData.numberofbins} disabled={this.props.isNoOfBinsEnabled} onInput={this.pickValue}  onChange={this.onchangeInput.bind(this)} className="form-control" />
                      </div>
              </div>
                    <div className="row form-group">
                        <label for="sel_to bg" className="col-sm-4 control-label">{"Specify intervals"}</label>
                        <div className="col-sm-8">
                        <input type="text" title="Please Enter " name="specifyintervals" defaultValue={binData.specifyintervals} disabled={this.props.isSpecifyIntervalsEnabled} onChange={this.onchangeInput.bind(this)} className="form-control" onInput={this.pickValue} />
                      </div>
                    </div>
                    <div className="row form-group">
                          <label for="sel_tobg" className="col-sm-4 control-label">{"New column name"}</label>
                          <div className="col-sm-8">
                          <input type="text" title="Please Enter " name="newcolumnname"  defaultValue={binData.newcolumnname} onChange={this.onchangeInput.bind(this)}   className="form-control" onInput={this.pickValue} />
                            </div>
                      </div>
                    </Tab.Pane>
        )


>>>>>>> 9525a3e74b9140bf34e670e00b67a5d9b4b9b137

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
