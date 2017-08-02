import React from "react";
import {render} from "react-dom";
import {BrowserRouter, Route, Switch, IndexRoute} from "react-router-dom";
import {Provider} from "react-redux"
import store from "./store"

import {Main} from "./components/Main";
import {Home} from "./components/Home";

import {Login} from "./components/Login";
//import {Signal} from "./components/Signal";
import {Settings} from "./components/Settings/Settings";
import {Apps} from "./components/Apps/Apps";
import {Data} from "./components/Data/Data";
import {Stories} from "./components/Stories/Stories";
import {Signals} from "./components/Signals/Signals"


// console.log(store);

class App extends React.Component {

  render() {

    return (
      <BrowserRouter>
      <Switch>
          <Route exact path="/login" component={Login}/>
          <Main>
            <Route path="/" component={Home} />
            <Route path="/signals" component={Signals} />
            <Route path="/settings" component={Settings} />
            <Route path="/apps" component={Apps} />
            <Route path="/stories" component={Stories} />
            <Route path="/data" component={Data} />
          </Main>
      </Switch>
      </BrowserRouter>
    );
  }

}

render(
  <Provider store={store}>
  <App/>
</Provider>, window.document.getElementById('app'));
