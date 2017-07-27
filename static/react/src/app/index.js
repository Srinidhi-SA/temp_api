import React from "react";
import {render} from "react-dom";
import {BrowserRouter, Route, Switch, Link, IndexRoute} from "react-router-dom";

import Home from "./templates/home";
import Login from "./templates/login";

class App extends React.Component {
  render() {

    return (
      <BrowserRouter>
        <div>
          <Route exact path="/" component={Login}/>
          <Route path="/home" component={Home}/>
        </div>
      </BrowserRouter>
    );
  }

}

render(
  <App/>, window.document.getElementById('app'));
