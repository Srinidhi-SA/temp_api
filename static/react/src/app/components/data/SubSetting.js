import React from "react";
import {connect} from "react-redux";
import {Button} from "react-bootstrap";
import ReactBootstrapSlider from 'react-bootstrap-slider'
import store from "../../store";
import {updateSubSetting} from "../../actions/dataActions";
import {showHideSubsetting, decimalPlaces} from "../../helpers/helper.js"
import {Scrollbars} from 'react-custom-scrollbars';
import dateFormat from 'dateformat';
import DatePicker from 'react-bootstrap-date-picker';

@connect((store) => {
  return {updatedSubSetting: store.datasets.updatedSubSetting, subsettingDone: store.datasets.subsettingDone};
})

export class SubSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      min: 0,
      max: 0,
      curmin: 0,
      curmax: 0,
      dimentionList: {},
      curdimention: [],
      selectedDimention: [],
      startDate: "",
      curstartDate: "",
      endDate: '',
      curendDate: "",
      subSettingRs: this.props.updatedSubSetting,
      alreadyUpdated: false,
      textboxUpdated: false
    };
  }
  handleStartDateChange(value, formattedValue) {
    this.state.curstartDate = formattedValue
    $("#saveButton").removeClass('btn-alt4')
    $("#saveButton").addClass('btn-primary')
    $("#saveButton").removeAttr('disabled')
  }
  handleEndDateChange(value, formattedValue) {
    this.state.curendDate = formattedValue
    $("#saveButton").removeClass('btn-alt4')
    $("#saveButton").addClass('btn-primary')
    $("#saveButton").removeAttr('disabled')
  }
  componentDidMount() {
    $(".bslider").slider();
    var that = this;
    $(function() {
      var selectAllChecked = true;
       $('.dimension[type="checkbox"]').each(function() {
          if (!$(this).is(":checked")) {
            selectAllChecked = false;
            $('#dim[type="checkbox"]').prop('checked', false);
          }
      });
      if(selectAllChecked == true)
      $('#dim[type="checkbox"]').prop('checked', true);

      $("#dim").click(function() { 
        let count = 0;
        if ($(this).is(":checked")) {
          $('.dimension[type="checkbox"]').prop('checked', true);
        } else {
          $('.dimension[type="checkbox"]').prop('checked', false);
        }

        that.state.selectedDimention = [];
        $('.dimension[type="checkbox"]').each(function() {

          if ($(this).is(":checked")) {
            count++;
            that.state.selectedDimention.push($(this).val());
          }
        });
        that.state.curdimention = that.state.selectedDimention
        $("#saveButton").removeClass('btn-alt4')
        $("#saveButton").addClass('btn-primary')
        $("#saveButton").removeAttr('disabled')
      });

      $('.dimension[type="checkbox"]').click(function() {
        let count = 0;
        let checkSelectAll = true;
        that.state.selectedDimention = [];
        $('.dimension[type="checkbox"]').each(function() {
          if (!$(this).is(":checked")) {
            checkSelectAll = false;
            $('#dim[type="checkbox"]').prop('checked', false);
          } else {
            count++;
            that.state.selectedDimention.push($(this).val());
          }
        });
        if(checkSelectAll == true)
        $('#dim[type="checkbox"]').prop('checked', true);
        $("#saveButton").removeClass('btn-alt4')
        $("#saveButton").addClass('btn-primary')
        $("#saveButton").removeAttr('disabled')
      });

      $('#saveSubSetting').click(function() {
        let count = 0;
        that.state.selectedDimention = [];
        $('.dimension[type="checkbox"]').each(function() {
          if (!$(this).is(":checked")) {
            $('#dim[type="checkbox"]').prop('checked', false);
          } else {

            count++;
            that.state.selectedDimention.push($(this).val());
          }
        });
        that.state.curdimention = that.state.selectedDimention
        $('#saveButton').removeClass('btn-primary')
        $('#saveButton').addClass('btn-alt4')
        $('#saveButton').attr('disabled', true);
      });
    });
    showHideSubsetting(this.props.item.columnType, this.state.dimentionList, this.props.item.dateSuggestionFlag)
    $('#saveButton').attr('disabled', true);
  }
  changeSliderValue(e) {
    //alert("coming")
      this.state.curmin = e.target.value[0]
      $("#from_value").val(this.state.curmin)
      this.state.curmax = e.target.value[1]
      $("#to_value").val(this.state.curmax)
      $("#saveButton").removeClass('btn-alt4')
      $("#saveButton").addClass('btn-primary')
      $("#saveButton").removeAttr('disabled') 
  }
  changeSliderValueFromText(e) {
    if (isNaN(e.target.value))
      alert("please enter a valid number")
    else {
      this.setState({
        curmin: parseInt(e.target.value),
        textboxUpdated: true
      })
      $("#saveButton").removeClass('btn-alt4')
      $("#saveButton").addClass('btn-primary')
      $("#saveButton").removeAttr('disabled')
    }
  }
  changeSliderValueToText(e) {
    if (isNaN(e.target.value))
      alert("please enter a valid number")
    else {
      this.setState({
        curmax: parseInt(e.target.value),
        textboxUpdated: true
      })
      $("#saveButton").removeClass('btn-alt4')
      $("#saveButton").addClass('btn-primary')
      $("#saveButton").removeAttr('disabled')
    }
  }

  getSubSettings(columnType) {

    switch (columnType) {
      case "measure":
        {
          //this.state.min = this.props.item.subsetting.measureSetting.minimumValue;
          //this.state.max = this.props.item.subsetting.measureSetting.maxValue;
          //  let value = [this.state.curmin, this.state.curmax]
          let precision = decimalPlaces(this.state.curmax)
          let step = (1 / Math.pow(10, precision))
          //alert(step)
          let value = [Number(this.state.curmin), Number(this.state.curmax)]
          if(this.state.curmin=="")
          value=[0,Number(this.state.curmax)]
          else if (this.state.curmax=="") {
            value=[Number(this.state.curmin),0]
          }
          return (
            <div>
              <div id="measure_subsetting">
                <h5 className="xs-pt-5">{this.props.item.name}</h5>
                <div className="xs-pt-20"></div>
                <div className="row">
                  <div className="col-xs-5">
                    <input type="number" step = {step} min = {this.state.min} max = {this.state.curmax} className="form-control" id="from_value" value={this.state.curmin} onChange={this.changeSliderValueFromText.bind(this)}/>
                  </div>
                  <div className="col-xs-2 text-center">
                    <label>To</label>
                  </div>
                  <div className="col-xs-5">
                    <input type="number" step = {step} min = {this.state.curmin} max = {this.state.max} className="form-control" id="to_value" value={this.state.curmax} onChange={this.changeSliderValueToText.bind(this)}/>
                  </div>
                  <div className="clearfix"></div>
                </div>
              </div>
              <div className="xs-p-20"></div>
              <div className="form-group text-center">
                <ReactBootstrapSlider value={value} triggerSlideEvent="true" change={this.changeSliderValue.bind(this)} step={step} max={this.state.max} min={this.state.min} range="true" tooltip="hide"/>
              </div>
            </div>
          );
        }
        break;
      case "dimension":
        {
          if (this.props.item.dateSuggestionFlag == false) {
            let dimList = this.state.dimentionList
            let curDim = this.state.curdimention
            let checked = false
            let dimTemplate = ""
            let selectAll = false
            if (dimList) {
              dimTemplate = Object.keys(dimList).map((item, i) => {
                checked = false;
                if (curDim.indexOf(item) > -1) {
                  checked = true
                }
                const dId = "chk_mes1_" + i;
                return (
                  <tr key={i}>
                    <td>
                      <div className="ma-checkbox inline"><input id={dId} type="checkbox" className="dimension" value={item} defaultChecked={checked}/>
                        <label htmlFor={dId}></label>
                      </div>
                    </td>
                    <td>{item}</td>
                    <td className="pts">{dimList[item]}</td>
                  </tr>
                )
              });

              if (curDim.length == Object.keys(dimList).length) {
                //alert("true")
                selectAll = true
              }
            }
            return (
              <div>
                {/* for dimention */}
                <div id="dimention_subsetting">

                  <h5 className="xs-pt-5">{this.props.item.name}</h5>

                  <div class="table-responsive">
                    <Scrollbars style={{ height: 170 }} renderTrackHorizontal={props => <div {...props} className="track-horizontal" style={{display:"none"}}/>}
		        renderThumbHorizontal={props => <div {...props} className="thumb-horizontal" style={{display:"none"}}/>}>
                      <table id="subset" className="tablesorter table table-condensed table-hover table-bordered">
                        <thead>
                          <tr>
                            <th>
                              <div class="ma-checkbox inline">
                                <input id="dim" type="checkbox" className="dimention" defaultChecked={selectAll}/>
                                <label htmlFor="dim"></label>
                              </div>
                            </th>
                            <th className="tb_srtColumn">
                              <b title={this.props.item.name}>{this.props.item.name}</b>
                            </th>
                            <th>
                              <b>Count</b>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {dimTemplate}
                        </tbody>
                      </table>
                    </Scrollbars>
                  </div>

                </div>
              </div>
            );
          } else {
            return (<div id="dimention_subsetting"/>);
          }
        }
        break;
      case "datetime":
        {
          // if (this.state.curstartDate == "")
          //   this.state.curstartDate = this.state.startDate
          //
          //   if (this.state.curendDate == "")
          //     this.state.curendDate = this.state.endDate

          return (
            <div>{/*for date*/}
              <div id="date_subsetting">
                <h5>From</h5>
                <div className="row">
                  <div className="col-xs-12">
                    <DatePicker key={this.state.startDate} minDate = {this.state.startDate} maxDate = {this.state.curendDate} id="start-datepicker" className="form-control" value={this.state.curstartDate} onChange={this.handleStartDateChange.bind(this)} showClearButton={false} dateFormat="YYYY-MM-DD"/>
                  </div>
                </div>
                <div className="clearfix"></div>
                <div className="xs-p-20"></div>
                <h5>To</h5>
                <div className="row">
                  <div className="col-xs-12">
                    <DatePicker key={this.state.endDate} minDate = {this.state.curstartDate} maxDate = {this.state.endDate} id="end-datepicker" className="form-control" value={this.state.curendDate} onChange={this.handleEndDateChange.bind(this)} showClearButton={false} dateFormat="YYYY-MM-DD"/>
                  </div>
                </div>
                <div className="clearfix"></div>
              </div>
            </div>
          );
        }
        break;
    }
  }
  getColumnData(columnType, columnName) {
    switch (columnType) {
      case "measure":
        {
          this.props.updatedSubSetting.measureColumnFilters.map((changeditem) => {
            if (changeditem.colname == columnName) {
              if(!this.state.textboxUpdated){
              this.state.curmin = changeditem.lowerBound
              this.state.curmax = changeditem.upperBound
            }
              this.state.alreadyUpdated = true
            }
          });
        }
        break;
      case "dimension":
        {
          this.props.updatedSubSetting.dimensionColumnFilters.map((changeditem) => {
            if (changeditem.colname == columnName) {
              this.state.curdimention = changeditem.values
              this.state.alreadyUpdated = true
            }
          });
        }
        break;
      case "datetime":
        {
          // {
          //      "colname" : "col1",
          //      "upperBound" : 34,
          //      "lowerBound" : 3,
          //      "filterType" : "valueRange"
          //    }
          this.props.updatedSubSetting.timeDimensionColumnFilters.map((changeditem) => {
            if (changeditem.colname == columnName) {
              this.state.curstartDate = changeditem.lowerBound
              this.state.curendDate = changeditem.upperBound

              this.state.alreadyUpdated = true
            }
          });
        }
        break;

    }
  }
  saveSubSetting(e) {
    //alert("save is called!!")
    switch (this.props.item.columnType) {
      case "measure":
        {
        let measureColumnFilter = this.props.updatedSubSetting.measureColumnFilters
        if (this.state.alreadyUpdated == true) {
          this.props.updatedSubSetting.measureColumnFilters.map((changeditem, i) => {
            if (changeditem.colname == this.props.item.name) {
              measureColumnFilter[i] = {
                "colname": this.props.item.name,
                "upperBound": Number(this.state.curmax),
                "lowerBound": Number(this.state.curmin),
                "filterType": "valueRange"
              };
            }
          });
          this.state.subSettingRs.measureColumnFilters = measureColumnFilter;
        } else {
            this.state.subSettingRs.measureColumnFilters.push({"colname": this.props.item.name, "upperBound": Number(this.state.curmax), "lowerBound": Number(this.state.curmin), "filterType": "valueRange"});
            this.state.alreadyUpdated = true
          }
        }
        break;
      case "dimension":
        {
          //this.getSelectedDimention();
          let dimensionColumnFilter = this.props.updatedSubSetting.dimensionColumnFilters

          if (this.state.alreadyUpdated == true) {
            this.props.updatedSubSetting.dimensionColumnFilters.map((changeditem, i) => {
              if (changeditem.colname == this.props.item.name) {
                dimensionColumnFilter[i] = {
                  "colname": this.props.item.name,
                  "values": this.state.curdimention,
                  "filterType": "valueIn"
                };
              }
            });
            this.state.subSettingRs.dimensionColumnFilters = dimensionColumnFilter;

          } else {
            this.state.subSettingRs.dimensionColumnFilters.push({"colname": this.props.item.name, "values": this.state.curdimention, "filterType": "valueIn"});
            this.state.alreadyUpdated = true
          }
        }
        break;
      case "datetime":
        {
          let timeDimensionColumnFilters = this.props.updatedSubSetting.timeDimensionColumnFilters
          if (this.state.alreadyUpdated == true) {
            this.props.updatedSubSetting.timeDimensionColumnFilters.map((changeditem, i) => {
              if (changeditem.colname == this.props.item.name) {
                timeDimensionColumnFilters[i] = {
                  "colname": this.props.item.name,
                  "upperBound": this.state.curendDate,
                  "lowerBound": this.state.curstartDate,
                  "filterType": "valueRange"
                };
              }
            });
            this.state.subSettingRs.timeDimensionColumnFilters = timeDimensionColumnFilters;
          } else {
            this.state.subSettingRs.timeDimensionColumnFilters.push({"colname": this.props.item.name, "upperBound": this.state.curendDate, "lowerBound": this.state.curstartDate, "filterType": "valueRange"});
            this.state.alreadyUpdated = true
          }
        }
        break;

    }
    if(this.props.item.columnType == "measure"){
      if ((this.state.curmin < this.state.min) || (this.state.curmin > this.state.max)) {
        bootbox.alert("Please select a range between " + this.state.min + " and " + this.state.max)
        $("#saveButton").removeClass('btn-alt4')
        $("#saveButton").addClass('btn-primary')
        $("#saveButton").removeAttr('disabled')
      }else if((this.state.curmax <= this.state.curmin) || (this.state.curmax > this.state.max)){
        bootbox.alert("Please select a range between " + this.state.min + " and " + this.state.max)
        $("#saveButton").removeClass('btn-alt4')
        $("#saveButton").addClass('btn-primary')
        $("#saveButton").removeAttr('disabled')
      }else{
        $('#saveButton').removeClass('btn-primary')
        $('#saveButton').addClass('btn-alt4')
        $('#saveButton').attr('disabled', true);
        this.props.dispatch(updateSubSetting(this.state.subSettingRs));
      }
    }else if(this.props.item.columnType == "datetime"){
      if( Date.parse(this.state.curstartDate) < Date.parse(this.state.startDate) || Date.parse(this.state.curstartDate) > Date.parse(this.state.endDate) ){
        bootbox.alert("Please select a range between " + this.state.startDate + " and " + this.state.endDate)
        $("#saveButton").removeClass('btn-alt4')
        $("#saveButton").addClass('btn-primary')
        $("#saveButton").removeAttr('disabled')
      }
      else if(Date.parse(this.state.curendDate) < Date.parse(this.state.curstartDate) || Date.parse(this.state.curendDate) > Date.parse(this.state.endDate)){
        bootbox.alert("Please select a range between " + this.state.startDate + " and " + this.state.endDate)
        $("#saveButton").removeClass('btn-alt4')
        $("#saveButton").addClass('btn-primary')
        $("#saveButton").removeAttr('disabled')
      }
      else{
        $('#saveButton').removeClass('btn-primary')
        $('#saveButton').addClass('btn-alt4')
        $('#saveButton').attr('disabled', true);
        this.props.dispatch(updateSubSetting(this.state.subSettingRs));
      }
    }
    else if(this.props.item.columnType == "dimension"){
      $('#saveButton').removeClass('btn-primary')
      $('#saveButton').addClass('btn-alt4')
      $('#saveButton').attr('disabled', true);
      this.props.dispatch(updateSubSetting(this.state.subSettingRs));
    }
  }
  callSubsetTableSorter() {
    $(function() {
      $('#subset').tablesorter({
        theme: 'ice',
        headers: {
          0: {
            sorter: false
          }
        }
      });
    });
  }
  render() {
    this.callSubsetTableSorter()
    let subsettingsTemplate = "";
    if (this.props.updatedSubSetting.measureColumnFilters.length > 0 || this.props.updatedSubSetting.dimensionColumnFilters.length > 0 || this.props.updatedSubSetting.timeDimensionColumnFilters.length > 0) {
      this.getColumnData(this.props.item.columnType, this.props.item.name)
    }
    if (this.props.item.columnStats != undefined) {
      this.props.item.columnStats.map((stats) => {
        if (stats.name == "min")
          this.state.min = stats.value
        else if (stats.name == "max") {
          this.state.max = stats.value
        } else if (stats.name == "LevelCount") {
          this.state.dimentionList = stats.value
        } else if (stats.name == "firstDate") {
          this.state.startDate = stats.value
        } else if (stats.name == "lastDate") {
          this.state.endDate = stats.value
        }
      });

      if (this.state.alreadyUpdated == false) {
        if (this.state.textboxUpdated == false) {
          this.state.curmax = this.state.max
          this.state.curmin = this.state.min
        }
        this.state.curstartDate = this.state.startDate
        this.state.curendDate = this.state.endDate
        if (this.state.dimentionList)
          this.state.curdimention = Object.keys(this.state.dimentionList);
        }
      subsettingsTemplate = this.getSubSettings(this.props.item.columnType)
    }

    return (
      <div>
        <div id="tab_subsettings" className="panel-group accordion accordion-semi">
          <div className="panel panel-default box-shadow">
            <div className="panel-heading">
              <h4 className="panel-title">
                <a data-toggle="collapse" data-parent="#tab_subsettings" href="#pnl_tbset" aria-expanded="true" className="">Sub Setting
                  <i className="fa fa-angle-down pull-right"></i>
                </a>
              </h4>
            </div>
            <div id="pnl_tbset" className="panel-collapse collapse in" aria-expanded="true">
              <div className="xs-pt-5 xs-pr-10 xs-pb-5 xs-pl-10">
                {subsettingsTemplate}
              </div>
              <div class="panel-footer">
                <div class="text-right" id="saveSubSetting">
                  <button href="javascript:void(0)" class="btn btn-alt4" id="saveButton" onClick={this.saveSubSetting.bind(this)}>
                    Save
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    )
  }

}