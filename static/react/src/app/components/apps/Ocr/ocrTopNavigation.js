import React from "react";
import { NavLink, withRouter } from "react-router-dom";
import { getUserDetailsOrRestart } from "../../../helpers/helper";
export class OcrTopNavigation extends React.Component {
  constructor(props) {
    super(props);
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
          {getUserDetailsOrRestart.get().userRole == ("Admin" || "Superuser") &&
            <li><NavLink className="" to="/apps/ocr-mq44ewz7bp/project/" activeClassName="active">
              <i class="fa fa-book fa-lg"></i> Projects
            </NavLink>
            </li>
          }
          {getUserDetailsOrRestart.get().userRole == ("Admin" || "Superuser") &&
            <li><NavLink className="" to="/apps/ocr-mq44ewz7bp/configure/" activeClassName="active">
              <i class="fa fa-sliders fa-lg"></i> Configure
              </NavLink>
            </li>
          }
          <li><NavLink className="" to="/apps/ocr-mq44ewz7bp/reviewer/" activeClassName="active">
            <i class="fa fa-users fa-lg"></i> Reviewers
              </NavLink>
          </li>
          {getUserDetailsOrRestart.get().userRole == ("Admin" || "Superuser") &&
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
