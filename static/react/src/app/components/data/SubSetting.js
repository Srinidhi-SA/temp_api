import React from "react";
import {connect} from "react-redux";
import {Button} from "react-bootstrap";
import ReactBootstrapSlider from 'react-bootstrap-slider'
import store from "../../store";
import {updateSubSetting} from "../../actions/dataActions";
import {showHideSubsetting} from "../../helpers/helper.js"
import {Scrollbars} from 'react-custom-scrollbars';

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
      endDate: "",
      subSettingRs: this.props.updatedSubSetting,
      alreadyUpdated: false
    };
  }
  componentDidMount() {
    $(".bslider").slider();
    var that = this;
    $(function() {
      $("#dim").click(function() { // select all dimension clicked
        //alert("workig")
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
        console.log(that.state.selectedDimention);
      });

      //Note:following will be called when we need to persist checklist on click of checkbox

      $('.dimension[type="checkbox"]').click(function() {
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
        console.log(that.state.selectedDimention);
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
        console.log(that.state.selectedDimention);
        $('#saveButton').removeClass('btn-primary')
        $('#saveButton').addClass('btn-alt4')
        $('#saveButton').attr('disabled', true);
      });
    });
    showHideSubsetting(this.props.item.columnType, this.state.dimentionList, this.props.item.dateSuggestionFlag)

  }
  changeSliderValue(e) {

    this.state.curmin = e.target.value[0]
    $("#from_value").val(this.state.curmin)
    this.state.curmax = e.target.value[1]
    $("#to_value").val(this.state.curmax)
    $("#saveButton").removeClass('btn-alt4')
    $("#saveButton").addClass('btn-primary')
    $("#saveButton").removeAttr('disabled')

  }
  getSubSettings(columnType) {
    switch (columnType) {
      case "measure":
        {
          //this.state.min = this.props.item.subsetting.measureSetting.minimumValue;
          //this.state.max = this.props.item.subsetting.measureSetting.maxValue;
          let value = [this.state.curmin, this.state.curmax]
          return (
            <div>
              <div id="measure_subsetting">
                <h5>{this.props.item.name}</h5>
                <div className="row">
                  <div className="col-xs-5">
                    <input type="text" className="form-control" id="from_value" value={this.state.curmin}/>
                  </div>
                  <div className="col-xs-2 text-center">
                    <label>To</label>
                  </div>
                  <div className="col-xs-5">
                    <input type="text" className="form-control" id="to_value" value={this.state.curmax}/>
                  </div>
                  <div className="clearfix"></div>
                </div>
              </div>
              <div className="xs-p-10"></div>
              <div className="form-group text-center">
                <ReactBootstrapSlider value={value} change={this.changeSliderValue.bind(this)} max={this.state.max} min={this.state.min} range="true" tooltip="hide"/>
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

                  <h5>{this.props.item.name}</h5>

                  <div class="table-responsive cst-scroll-panel">
                    <Scrollbars>
                      <table id="subset" className="tablesorter table table-condensed table-hover table-bordered">
                        <thead>
                          <tr>
                            <th>
                              <div class="ma-checkbox inline">
                                <input id="dim" type="checkbox" className="dimention" defaultChecked={selectAll}/>
                                <label htmlFor="dim"></label>
                              </div>
                            </th>
                            <th>
                              <b>{this.props.item.name}</b>
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
      case "timedimention":
        {
          return (
            <div>{/*for date*/}
              <div id="date_subsetting">
                <h5>{this.props.item.name}</h5>
                date subsetting
              </div>
            </div>
          );
        }
        break;
    }
  }
  getSelectedDimention() {
    //alert("working")
  }
  getColumnData(columnType, columnName) {
    switch (columnType) {
      case "measure":
        {
          this.props.updatedSubSetting.measureColumnFilters.map((changeditem) => {
            if (changeditem.colname == columnName) {
              this.state.curmin = changeditem.lowerBound
              this.state.curmax = changeditem.upperBound

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
      case "timedimension":
        {}
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
                  "upperBound": this.state.curmax,
                  "lowerBound": this.state.curmin,
                  "filterType": "valueRange"
                };
              }
            });
            this.state.subSettingRs.measureColumnFilters = measureColumnFilter;
          } else {
            this.state.subSettingRs.measureColumnFilters.push({"colname": this.props.item.name, "upperBound": this.state.curmax, "lowerBound": this.state.curmin, "filterType": "valueRange"});
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
      case "timedimention":
        {
          this.state.subSettingRs.timeDimensionColumnFilters.push({"colname": "col1", "upperBound": 34, "lowerBound": 3, "filterType": "valueRange"});
        }
        break;

    }
    $('#saveButton').removeClass('btn-primary')
    $('#saveButton').addClass('btn-alt4')
    $('#saveButton').attr('disabled', true);
    this.props.dispatch(updateSubSetting(this.state.subSettingRs));

  }
  render() {
    console.log("subsetting is called!!");
    console.log(this.props)
    console.log("state is")
    console.log(this.state)
    $(function() {
    $('#subset').tablesorter({
        theme: 'ice',
        headers: {
            0: { sorter: false }
        }
       });
       $("#dim").click();
    });
    if (this.props.updatedSubSetting.measureColumnFilters.length > 0 || this.props.updatedSubSetting.dimensionColumnFilters.length > 0 || this.props.updatedSubSetting.timeDimensionColumnFilters.length > 0) {
      this.getColumnData(this.props.item.columnType, this.props.item.name)
    }
    this.props.item.columnStats.map((stats) => {
      //  console.log(stats)
      if (stats.name == "min")
        this.state.min = stats.value
      else if (stats.name == "max") {
        this.state.max = stats.value
      } else if (stats.name == "LevelCount") {
        this.state.dimentionList = stats.value
      }
    });

    if (this.state.alreadyUpdated == false) {
      this.state.curmax = this.state.max
      this.state.curmin = this.state.min
      if (this.state.dimentionList)
        this.state.curdimention = Object.keys(this.state.dimentionList);
      }
    console.log("after assign")
    console.log(this.state)

    let subsettingsTemplate = this.getSubSettings(this.props.item.columnType)

    return (
      <div>
        {/*Start Tab Subsettings*/}
        <div id="tab_subsettings" className="panel-group accordion accordion-semi">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h4 className="panel-title">
                <a data-toggle="collapse" data-parent="#tab_subsettings" href="#pnl_tbset" aria-expanded="true" className="">Sub Setting
                  <i className="fa fa-angle-down pull-right"></i>
                </a>
              </h4>
            </div>
            <div id="pnl_tbset" className="panel-collapse collapse in" aria-expanded="true">
              <div className="panel-body">
                {subsettingsTemplate}
                <hr/>
                <div class="text-right" id="saveSubSetting">
                  <a href="javascript:void(0)" class="btn btn-alt4" id="saveButton" disabled onClick={this.saveSubSetting.bind(this)}>
                    Save
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* End Tab Subsettings */}
      </div>

    )
  }

}
