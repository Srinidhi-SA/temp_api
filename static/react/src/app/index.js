import React from "react";
import {render} from "react-dom";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {Provider} from "react-redux"
import store from "./store"

import {Home} from "./components/home";
import {Login} from "./components/login";
import {Signals} from "./components/DescriptionPanel/signals";
import {TopPanel} from "./components/TopPanel/TopPanel";
import {LeftPanel} from "./components/LeftPanel/LeftPanel";


// import {Signals} from "./components/DescriptionPanel/signals";

// console.log(store);

class App extends React.Component {

  render() {

    return (
      <BrowserRouter>
      <div>
          <Route exact path="/login" component={Login}/>
          <Route path="/" component={Home} />
          {/*<Route path="/signals" component={Signals} selectedComponentLocation="signals"/>
          <Route path="/signals/:slug" component={Signal} selectedComponentLocation="signals"/>
          <Route path="/signals/:slug/:analysis_type" component={Signal} selectedComponentLocation="signals"/>
          <Route path="/signals/:slug/:analysis_type/:filter" component={Signal} selectedComponentLocation="signals"/>
          */}</div>
      </BrowserRouter>
    );
  }

}

render(
  <Provider store={store}>
  <App/>
</Provider>, window.document.getElementById('app'));
