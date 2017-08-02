import React from "react";
import {render} from "react-dom";
import {BrowserRouter, Route, Switch, IndexRoute} from "react-router-dom";
import {Provider} from "react-redux"
import store from "./store"

import {Main} from "./components/Main";
import {Home} from "./components/Home";

import {Login} from "./components/Login";
//import {Signal} from "./components/Signal";
import {Settings} from "./components/settings/Settings";
import {Apps} from "./components/apps/Apps";
import {Data} from "./components/data/Data";
import {Stories} from "./components/stories/Stories";
import {Signals} from "./components/signals/Signals"
import {Signal} from "./components/signals/Signal"


// console.log(store);

class App extends React.Component {

  render() {

    return (
      <BrowserRouter>
      <Switch>
          <Route exact path="/login" component={Login}/>
          <Main>
            <Route exact path="/" component={Home} />
            <Route exact path="/signals" component={Signals} />
            <Route path="/signals/:slug" component={Signal}/>
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
