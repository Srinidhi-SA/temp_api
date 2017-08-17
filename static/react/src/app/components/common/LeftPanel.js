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
                  <li>
                    <NavLink className="sdb_signal" to="/signals">
                      <span></span>
                      SIGNALS</NavLink>
                  </li>
                {/*  <li>
                    <NavLink className="sdb_story" to ="/stories">
                      <span></span>
                      STORY</NavLink>
                  </li>*/}
                  <li>
                    <NavLink className="sdb_app" to ="/apps">
                      <span></span>
                      APPS</NavLink>
                  </li>
                  <li>
                    <NavLink className="sdb_data" to ="/data">
                      <span></span>
                      DATA</NavLink>
                  </li>
                  <li>
                    <NavLink className="sdb_settings" to ="/settings">
                      <span></span>
                      SETTINGS</NavLink>
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
