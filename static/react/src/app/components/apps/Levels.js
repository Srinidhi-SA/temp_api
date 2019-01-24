import React from "react";
import { connect } from "react-redux";
import { Scrollbars } from 'react-custom-scrollbars';
import {MultiSelect} from 'primereact/multiselect';
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
    dataSets: store.datasets.allDataSets,
    binsOrLevelsShowModal: store.datasets.binsOrLevelsShowModal,
    transferColumnShowModal: store.datasets.transferColumnShowModal,
    selectedBinsOrLevelsTab: store.datasets.selectedBinsOrLevelsTab,
    selectedItem: store.datasets.selectedItem,
    featureEngineering:store.datasets.featureEngineering,
  };
})
export class Levels extends React.Component {
  constructor(props) {
    super(props);
    this.pickValue = this.pickValue.bind(this);
    console.log("Levels constructor method is called...");
    this.state = { levelsArray: [{ name: "" }] ,
    cars1: [],
    cars2: []}
  }

  componentWillMount() {
    console.log("Levels componentWillMount method is called...");
  }

  handleLevelSubmit = evt => {

  };

  handleAddLevel(){
    this.setState({
      levelsArray: this.state.levelsArray.concat([{ name: "" }])
    });
  };

  handleRemoveLevel(idx){
    this.setState({
      levelsArray: this.state.levelsArray.filter((s, sidx) => idx !== sidx)
    });
  };

  getLevelData(){
    var levelData = {};
    if(this.props.featureEngineering != undefined || this.props.featureEngineering !=null){
    var slugData = this.props.featureEngineering[this.props.selectedItem.slug];
      if(slugData != undefined){
        levelData = slugData.levelData;
      }

    }
    return levelData;
  }

  pickValue(event){
    this.props.parentPickValue("levelData", event);
  }

  onchangeInput(event){
    return event.target.value;
  }

  onClickCheckBox(event) {
    var checkedValue = event.target.checked;
    var checkedAttr = event.target.name;
    console.log("checkedval:", checkedValue, "checkedAttr:", checkedAttr);
    if (checkedValue) {
        this.state.statesArray.filter(item => item.name == checkedAttr);
    } else {
        var obj = { name: checkedAttr };
        if (this.state.statesArray[checkedAttr] != undefined) {
          this.state.statesArray.push(obj);
        }
      }
    }


  render() {
    console.log("Levels render method is called...");

    var levelData = this.getLevelData();

    const cars = [
            {label: 'Audi', value: 'Audi'},
            {label: 'BMW', value: 'BMW'},
            {label: 'Fiat', value: 'Fiat'},
            {label: 'Honda', value: 'Honda'},
            {label: 'Jaguar', value: 'Jaguar'},
            {label: 'Mercedes', value: 'Mercedes'},
            {label: 'Renault', value: 'Renault'},
            {label: 'VW', value: 'VW'},
            {label: 'Volvo', value: 'Volvo'}
        ];


    var levels = "";
    levels = (
      <Tab.Pane>
        {this.state.levelsArray.map((level, idx) => (
          <form class="form_withrowlabels form-inline">

          <div class="clearfix"></div>
          <div class="form-group">
            <input type="text" name={`name #${idx + 1}`} class="form-control" placeholder={`level #${idx + 1} name`} onInput={this.pickValue}  onChange={this.onchangeInput.bind(this)} />
          </div>
          <div class="form-group">
            <label for="txt_sPeriod">&nbsp;&nbsp;&nbsp; Which will include:</label>
          </div>
          <div class="form-group">

          <div className="content-section implementation multiselect-demo">
          <MultiSelect value={this.state.cars1} options={cars} onChange={(e) => this.setState({cars1: e.value})}
                            style={{minWidth:'12em'}} filter={true}  />

          </div>
          </div>
          <button class="btn btn-primary b-inline" onClick={this.handleRemoveLevel.bind(this,idx)} ><i class="fa fa-close"></i></button>
          <button class="btn btn-primary b-inline" onClick={this.handleAddLevel.bind(this)} ><i class="fa fa-plus"></i></button>
        </form>

        ))}
      </Tab.Pane>
    )

    return (
      <div>
        <Tab.Container id="left-tabs-example">
          <Row className="clearfix">
            <Col sm={15}>
              <Tab.Content animation>{levels}</Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    );
  }


}
