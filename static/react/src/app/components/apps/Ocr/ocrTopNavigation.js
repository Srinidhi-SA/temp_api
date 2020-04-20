import React from "react";
import { NavLink, withRouter } from "react-router-dom";
import { getUserDetailsOrRestart } from "../../../helpers/helper";
import { saveDocumentPageFlag } from '../../../actions/ocrActions';
export class OcrTopNavigation extends React.Component {
  constructor(props) {
    super(props);
  }

  handleRoute(){ //Making docFlag false on click of navLink,to load project & reviewer table,Without this proDoc table is getting loaded
  this.props.dispatch(saveDocumentPageFlag(false)) 
  }
  render() {
    return (
      <div>
        <div class="page-head" style={{ paddingTop: 10, paddingBottom: 15, paddingLeft: 2 }}>
          <div class="row">
            <div class="col-md-7">
              <h3 class="xs-mt-0 nText">Intelligent Text Extractor</h3>
            </div>
          </div>
        </div>
        <ul className="nav nav-tabs cst_ocr_tabs">
          <li>
            <NavLink exact={true} className="" to="/apps/ocr-mq44ewz7bp/" activeClassName="active">
              <i class="fa fa-tachometer fa-lg"></i> Dashboard
            </NavLink>
          </li>
          {(getUserDetailsOrRestart.get().userRole == "Admin" || getUserDetailsOrRestart.get().userRole ==  "Superuser") &&
            <li><NavLink className="" to="/apps/ocr-mq44ewz7bp/project/" onClick={this.handleRoute.bind(this)} activeClassName="active">
              <i class="fa fa-book fa-lg"></i> Projects
            </NavLink>
            </li>
          }
          {(getUserDetailsOrRestart.get().userRole == "Admin" || getUserDetailsOrRestart.get().userRole ==  "Superuser") &&
            <li><NavLink className="" to="/apps/ocr-mq44ewz7bp/configure/" activeClassName="active">
              <i class="fa fa-sliders fa-lg"></i> Configure
              </NavLink>
            </li>
          }
          <li><NavLink className="" to="/apps/ocr-mq44ewz7bp/reviewer/" onClick={this.handleRoute.bind(this)} activeClassName="active">
            <i class="fa fa-users fa-lg"></i> Reviewers
              </NavLink>
          </li>
          {(getUserDetailsOrRestart.get().userRole == "Admin" || getUserDetailsOrRestart.get().userRole == "Superuser") &&
            <li><NavLink className="" to="/apps/ocr-mq44ewz7bp/manageUser/" activeClassName="active">
              <i class="fa fa-user fa-lg"></i> Users
              </NavLink>
            </li>
          }
        </ul>

      </div>
    );
  }

}
