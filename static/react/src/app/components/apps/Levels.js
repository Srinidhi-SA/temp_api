import React from "react";
import { connect } from "react-redux";
import { Scrollbars } from 'react-custom-scrollbars';
import { MultiSelect } from 'primereact/multiselect';
import dateFormat from 'dateformat';
import DatePicker from 'react-bootstrap-date-picker';
import { Button, Dropdown, Menu, MenuItem, Modal, Nav, NavItem, Tab, Row, Col } from "react-bootstrap";
import {
  openBinsOrLevelsModalAction,
  closeBinsOrLevelsModalAction,
  openTransformColumnModalAction,
  closeTransformColumnModalAction,
  selectedBinsOrLevelsTabAction,
} from "../../actions/dataActions";
import { saveBinLevelTransformationValuesAction } from "../../actions/featureEngineeringActions";

@connect((store) => {
  return {
    login_response: store.login.login_response,
    dataPreview: store.datasets.dataPreview,
    dataSets: store.datasets.allDataSets,
    binsOrLevelsShowModal: store.datasets.binsOrLevelsShowModal,
    transferColumnShowModal: store.datasets.transferColumnShowModal,
    selectedBinsOrLevelsTab: store.datasets.selectedBinsOrLevelsTab,
    selectedItem: store.datasets.selectedItem,
    featureEngineering: store.datasets.featureEngineering,
    datasets: store.datasets,
    editmodelFlag: store.datasets.editmodelFlag,
    modelEditconfig: store.datasets.modelEditconfig,
  };
})

export class Levels extends React.Component {
  
  constructor(props) {
    super(props);
    this.pickValue = this.pickValue.bind(this);
    this.state = { levelsArray: this.props.levelsData,
    
    }
    // this.handleRemoveLevel = this.handleRemoveLevel.bind(this);
    
  }

  getAllOptions() {
    // datasets.dataPreview.meta_data.scriptMetaData.columnData[8].columnStats[5].value
    // datasets.selectedVariables[""1cbce2ce373e42248952e902fc03046f""]
    // datasets.dataPreview.meta_data.uiMetaData.columnDataUI[8].columnStats[5].value.Arkansas
    let levelOptions = Object.keys(this.props.dataPreview.meta_data.scriptMetaData.columnData.filter(item => item.slug == this.props.selectedItem.slug)[0].columnStats.filter(options => (options.name == "LevelCount"))[0].value)
    levelOptions.sort();
    return levelOptions
  }

  getMultiSelectOptions(idx) {
    var allSelectedItemsExceptCur = this.getAllSelectedOptionsExceptCurrent(idx);
    return this.getAllOptions().filter(item => !allSelectedItemsExceptCur.has(item)).map(function (elem) {
      return { "label": elem, "value": elem };


    });
  }

  getAllSelectedOptionsExceptCurrent(idx) {

    this.getAllOptions();
    var allSelectedItems = new Set();
    this.state.levelsArray.map(function (elem, elemIdx) {
      if (elemIdx != idx) {
        allSelectedItems = new Set([...allSelectedItems, ...elem.multiselectValue])
      }
    });
    var storeValue = this.state.levelsArray.map(i=>i.multiselectValue);
    var reducestoreValue = storeValue.reduce((acc, val) => acc.concat(val), []);
    if(this.getAllOptions().length == reducestoreValue.length){
        $(".addn").addClass("noDisplay");
        
      // if((($('ul').last().find('li')).length == 0 ) ){
      // $(".form_withrowlabels").last().css("display","none");
      // }
    }
    else{
      $(".addn").removeClass("noDisplay");
    }
    return allSelectedItems;
  }

  componentWillMount() {
    this.addNewLevel();  
  }

  componentWillUpdate() {
   this.props.parentUpdateLevelsData(this.state.levelsArray);
  }

  componentDidMount() {
    
    if((($('ul').last().find('li')).length == 0 ) ){
       $(".form_withrowlabels").last().css("display","none");
    }

    if ($('#dimSEdate').hasClass('wide-modal')) {
      $('.modal-colored-header').addClass('modal-lg-dimSEdate');
    }
    $('.p-multiselect-item label').prop('title', function () { return $(this).text(); });
    
  }

  addNewLevel() {
    var newObj = { "inputValue": "", "multiselectValue": "", "startDate": "", "endDate": "" };
    
      this.setState({
        levelsArray: this.state.levelsArray.concat([newObj,])
      });
   
  };

  

  handleRemoveLevel(idx, event) {
    this.setState({
      levelsArray: this.state.levelsArray.filter((s, sidx) => idx !== sidx)
    });
    this.props.parentUpdateLevelsData(this.state.levelsArray);
  };

  getLevelData() {
    var levelData = {};
    if (this.props.featureEngineering != undefined || this.props.featureEngineering != null) {
      var slugData = this.props.featureEngineering[this.props.selectedItem.slug];
      if (slugData != undefined) {
        levelData = slugData.levelData;
      }
    }
    return levelData;
  }

  pickValue(event) {
    this.props.parentPickValue("levelData", event);
  }

  onchangeInput(event) {
    return event.target.value;
  }

  onClickCheckBox(event) {
    var checkedValue = event.target.checked;
    var checkedAttr = event.target.name;
    if (checkedValue) {
      this.state.statesArray.filter(item => item.name == checkedAttr);
    } else {
      var obj = { name: checkedAttr };
      if (this.state.statesArray[checkedAttr] != undefined) {
        this.state.statesArray.push(obj);
      }
    }
  }

  inputOnChangeHandler(idx, valueToChange, event) {
    var newArray = this.state.levelsArray;
    newArray[idx][valueToChange] = event.target.value;
    this.setState({
      levelsArray: newArray
    });
  }

  multiSelectOnChangeHandler(idx, event) {
    var newArray = this.state.levelsArray;
    newArray[idx]["multiselectValue"] = event.target.value;
    this.setState({
      levelsArray: newArray
    });
  }

  render() {
    if (this.props.selectedItem.columnType == "dimension") {
      var levelData = this.getLevelData();
      var levels = "";
      levels = (
        <Tab.Pane>

          <div>
            {this.state.levelsArray.map((level, idx) => (
              <div className="form_withrowlabels form-inline" key={idx} >
                <div className="form-group">
                  <label for="txt_lName1">{`${idx + 1}`}&nbsp;&nbsp;&nbsp;</label>
                 <input id={`Level#${idx + 1}`} type="text" value={level.inputValue} name={`name #${idx + 1}`} name="newcolumnname" className="form-control levelrequired" placeholder={`Level #${idx + 1} name`} defaultValue={levelData.inputValue}  onInput={this.inputOnChangeHandler.bind(this, idx, "inputValue")} required/>
               </div>
                <div className="form-group">
                  <label for="txt_sPeriod">&nbsp;&nbsp;&nbsp; Which will include:&nbsp;</label>
                </div>
                <div className="form-group">
                  <div className="content-section implementation multiselect-demo">
                    <MultiSelect value={level.multiselectValue} options={this.getMultiSelectOptions(idx)} defaultValue={levelData.multiselectValue} onChange={this.multiSelectOnChangeHandler.bind(this, idx)}
                      style={{ minWidth: '12em' }}  filter={true} placeholder="choose" />
                  </div>
                </div>
                <div className="form-group">
                  &nbsp;<button className="btn btn-grey b-inline" data-levelIndex={idx} onClick={this.handleRemoveLevel.bind(this, idx)} ><i className="fa fa-close"></i></button>
                </div>

              </div>

            ))}
            <button className="btn btn-primary b-inline addn" onClick={this.addNewLevel.bind(this)} ><i className="fa fa-plus"> Add</i></button>

          </div>
          <div className="row form-group">
            <div className="col-sm-12 text-center">
              <div className="text-danger visibilityHidden" id="fileErrorMsg" style={{'padding-top':'15px'}}></div>
            </div>
          </div>

        </Tab.Pane>
      )



    }
    else {
      var dtlevels = "";

      var cname = this.props.datasets.dataPreview.meta_data.scriptMetaData.columnData.filter(item => (item.slug == this.props.selectedItem.slug)).map(name => {
        return (<span>{name.name}</span>);
      })

      var startDate = this.props.dataPreview.meta_data.scriptMetaData.columnData.filter(item => item.slug == this.props.selectedItem.slug)[0].columnStats.filter(options => (options.name == "firstDate"))[0].value
      var endDate = this.props.dataPreview.meta_data.scriptMetaData.columnData.filter(item => item.slug == this.props.selectedItem.slug)[0].columnStats.filter(options => (options.name == "lastDate"))[0].value
      dtlevels = (
        <Tab.Pane>
          <p>Please create new levels based on <b> {cname} </b>column by selecting start and end between "<i>{startDate}</i>" and "<i>{endDate}</i>". </p>
          <div id="dimSEdate" className="wide-modal">
            {this.state.levelsArray.map((level, idx) => (
              <div className="form_withrowlabels form-inline" key={idx} >
                <div className="form-group">
                  <label for="txt_lName1">{`${idx + 1}`}&nbsp;&nbsp;&nbsp;</label>
                  <input type="text" id="txt_lName1" value={level.inputValue} name="inputVal" defaultValue={level.newcolumnname} className="form-control" placeholder={`Level #${idx + 1} name`} onInput={this.inputOnChangeHandler.bind(this, idx, "inputValue")} />&nbsp;&nbsp;&nbsp;
                </div> 
                <div class="form-group">
                  <label for="txt_sPeriod1">&nbsp;&nbsp;&nbsp; Start period:</label>
                  <input type="date" id="txt_sPeriod1" value={level.startDate} min={startDate} max={endDate} defaultValue={startDate} className="form-control" onInput={this.inputOnChangeHandler.bind(this, idx, "startDate")} />
                </div>


                {/* <div className="col-xs-12">
            <DatePicker key={this.state.startDate} minDate = {startDate} maxDate = {endDate} id="start-datepicker" className="form-control" value={this.state.curstartDate} onChange={this.handleStartDateChange.bind(this)} showClearButton={false} dateFormat="YYYY-MM-DD"/>
          </div> */}

                <div class="form-group">
                  <label for="txt_ePeriod1">&nbsp;&nbsp;&nbsp; End period:</label>
                  <input type="date" id="txt_ePeriod1" value={level.endDate} min={startDate} max={endDate} defaultValue={endDate} className="form-control" onInput={this.inputOnChangeHandler.bind(this, idx, "endDate")} />
                </div>
                <div className="form-group">
                  &nbsp;<button className="btn btn-grey b-inline" data-levelIndex={idx} onClick={this.handleRemoveLevel.bind(this, idx)} ><i className="fa fa-close"></i></button>
                </div>
              </div>
            ))}
            <button className="btn btn-primary b-inline addn" onClick={this.addNewLevel.bind(this)} ><i className="fa fa-plus"> Add</i></button>
          </div>
          <div className="row form-group">
            <div className="col-sm-12 text-center">
              <div className="text-danger visibilityHidden" id="fileErrorMsg" style={{'padding-top':'15px'}}></div>
            </div>
          </div>
        </Tab.Pane>
      )
    }

    return (
      <div className="binsLevelsHeight">
        <Tab.Container id="left-tabs-example">
          <Row className="clearfix">
            <Col sm={15}>
              <Tab.Content animation>{(this.props.selectedItem.columnType == "dimension") ? levels : dtlevels}</Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    );
  }
}