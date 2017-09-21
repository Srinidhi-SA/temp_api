import React from "react";
import {connect} from "react-redux";
// import {Link, Redirect} from "react-router-dom";
// import {push} from "react-router-redux";
import {
  Modal,
  Button,
  Tab,
  Row,
  Col,
  Nav,
  NavItem
} from "react-bootstrap";
import ReactBootstrapSlider from 'react-bootstrap-slider'
// import Dropzone from 'react-dropzone'
import store from "../../store";
// import $ from "jquery";
//
// import {open,close,fileUpload,dataUpload} from "../../actions/dataUploadActions";
// import {saveFileToStore} from "../../actions/dataSourceListActions";
// import {DataSourceList} from "./DataSourceList";

@connect((store) => {
  return {login_response: store.login.login_response, dataPreview: store.datasets.dataPreview, updatedDataPreview: store.datasets.updatedDataPreview};
})

export class SubSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      min: 0,
      max: 0,
      dimentionList: {},
      startDate: "",
      endDate: ""
    };
  }
  componentDidMount() {
    $(".bslider").slider();
  }
  changeSliderValue(e) {

    this.state.min = e.target.value[0]
    $("#from_value").val(this.state.min)
    this.state.max = e.target.value[1]
    $("#to_value").val(this.state.max)

  }

  getSubSettings(columnType) {
    switch (columnType) {
      case "measure":
        {
          //this.state.min = this.props.item.subsetting.measureSetting.minimumValue;
          //this.state.max = this.props.item.subsetting.measureSetting.maxValue;
        //  let range = "[" + this.state.min + "," + this.state.max + "]"
          return (
            <div>
              <div id="measure_subsetting">
                <div className="col-xs-4">
                  <input type="text" className="form-control" id="from_value" value={this.state.min}/>
                </div>
                <div className="col-xs-3">
                  <label>To</label>
                </div>
                <div className="col-xs-4">
                  <input type="text" className="form-control" id="to_value" value={this.state.max}/>
                </div>
              </div>
              <div className="form-group">
                <ReactBootstrapSlider change={this.changeSliderValue.bind(this)} max={this.state.max} min={this.state.min} range="true" tooltip="hide"/>
              </div>
            </div>
          );
        }
        break;
      case "dimension":
        {	let dimList  = this.state.dimentionList
					let dimTemplate = Object.keys(dimList).map((item,i)=>{

						return(
							<tr key = {i}>
								<td><div class="ma-checkbox inline"><input id="chk_mes1" type="checkbox" class="needsclick"/><label for="chk_mes1"></label></div></td>
								<td>{item}</td>
								<td>{dimList[item]}</td>
							</tr>
						)
					});
          return (
            <div>
              {/* for dimention */}
              <div id="dimention_subsetting">
                <div className="row">
								<div class="col-md-12 cst-scroll-panel">
										<div class="table-responsive">
											<table class="table table-condensed table-hover table-bordered">
												<thead>
													<tr>
													<td>
													<div class="ma-checkbox inline">
													<input id="check1" type="checkbox" class="needsclick"/>
													<label for="check1"></label>
													</div>
													</td>
													<td> <b>{this.props.item.name}</b> </td>
													<td><b>Count</b> </td>
												</tr>
												</thead>
												<tbody>
												{dimTemplate}
												</tbody>
											</table>
										</div>
									</div>
                </div>
              </div>
            </div>
          );
        }
        break;
      case "timedimention":
        {
          return (
            <div>{/*for date*/}
              <div id="date_subsetting">
                date subsetting
              </div>
            </div>
          );
        }
        break;
    }
  }

  saveSubSetting(e) {

    switch (this.props.item.columnType) {
      case "measure":
        {}
      case "dimention":
        {}
    }
  }
  render() {
    console.log("subsetting is called!!");
    console.log(this.props);
    console.log(this.state)
    this.props.item.columnStats.map((stats) => {
      console.log(stats)
      if (stats.name == "min")
        this.state.min = stats.value
      else if (stats.name == "max") {
        this.state.max = stats.value
      } else if (stats.name == "LevelCount") {
        this.state.dimentionList = stats.value
      }
    });
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
                <div class="text-right" id="saveSubSetting">
                  <Button class="btn btn-alt4" onClick={this.saveSubSetting.bind(this)}>
                    Save
                  </Button>
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
