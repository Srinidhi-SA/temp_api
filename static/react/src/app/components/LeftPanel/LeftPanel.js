import React from "react";
import {NavLink} from "react-router-dom";

export default class LeftPanel extends React.Component {

  render() {
    console.log("LeftPanel")
    return (
      <div>
        <div>
            {/* Side bar Main Menu -->*/}
            <div className="side-menu">
              <div className="side-menu-container">
                <ul className="nav navbar-nav">
                  <li className="active">
                    <NavLink activeClassName="sdb_signal" to="/signals">
                      <span></span>
                      SIGNALS</NavLink>
                  </li>
                  <li>
                    <a href="#" className="sdb_story">
                      <span></span>
                      STORY</a>
                  </li>
                  <li>
                    <a href="#" className="sdb_app">
                      <span></span>
                      APPS</a>
                  </li>
                  <li>
                    <a href="#" className="sdb_data">
                      <span></span>
                      DATA</a>
                  </li>
                  <li>
                    <a href="#" className="sdb_settings">
                      <span></span>
                      SETTINGS</a>
                  </li>
                </ul>
              </div>
              {/* // /.Side bar Main Menu  -->*/}
            </div>
            {/*/ ./Side bar Main Menu -->

								            // Main Content starts with side-body -->*/}

        </div>

      </div>

    );
  }
}
