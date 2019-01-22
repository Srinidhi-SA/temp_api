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
    selectedItem: store.datasets.selectedItem,
  };
})

export class Transform extends React.Component {
  constructor(props) {
    super(props);
    console.log("Transform constructor method is called...");
  }

  componentWillMount() {
    console.log("Transform componentWillMount method is called...");
  }

  render() {
    console.log("Transforms render method is called...");

    )

    return (
      <div class="modal fade" id="1st_trsColumn" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>
              <h3 class="modal-title" >Transform column</h3>
            </div>
            <div class="modal-body">
              <h4>What would you like to do with “Quantity” column?</h4>
              <p>Please select any of the options provided below that will help in transforming the chosen column into multiple new features.
                Each option will create an additional feature derived out of the original column.</p>
              <hr/>
              <!-- content goes here -->
              <form class="form_withrowlabels">
                <div class="row form-group">
                  <div class="col-md-5 col-sm-5">
                    <div class="ma-checkbox inline">
                      <input id="qnty_chk1" type="checkbox" class="needsclick"/>
                      <label for="qnty_chk1">Replace values where Quantity is:</label>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-3">
                    <input type="text" id="txt_qnt1" class="form-control" placeholder="Value" />
                  </div>
                  <label for="txt_qValue1" class="col-md-1 col-sm-1 control-label xs-p-0 xs-mt-5 text-right">With</label>
                  <div class="col-md-3 col-sm-3">
                    <select class="form-control" id="txt_qValue1">
                      <option>Mean</option>
                      <option>Median</option>
                      <option>Mode</option>
                    </select>
                  </div>
                </div>


                <div class="row form-group">
                  <div class="col-md-5 col-sm-5">
                    <div class="ma-checkbox inline">
                      <input id="qnty_chk6" type="checkbox" class="needsclick"/>
                      <label for="qnty_chk6">Perform standardization:</label>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-3">
                    <select class="form-control" id="drp_qnt6">
                      <option selected>Min-Max Scaling</option>
                      <option>Log Transformation</option>
                    </select>
                  </div>
                </div>
                <div class="row form-group">
                  <div class="col-md-5 col-sm-5">
                    <div class="ma-checkbox inline">
                      <input id="qnty_chk7" type="checkbox" class="needsclick"/>
                      <label for="qnty_chk7">Transform variable using:</label>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-3">
                    <select class="form-control" id="drp_qnt7">
                      <option>Min-Max Scaling</option>
                      <option selected>Log Transformation</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <div class="btn-group" role="group" aria-label="group button">
                <div class="btn-group" role="group">
                  <button type="button" class="btn btn-default" data-dismiss="modal"  role="button">Cancel</button>
                </div>
                <div class="btn-group" role="group">
                  <button type="button"  class="btn btn-primary btn-hover-green" data-action="Create" role="button">Create</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
