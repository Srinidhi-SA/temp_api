import React from "react";
import {render} from "react-dom";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import { Provider } from "react-redux"
import store from "./store"

import {Home} from "./components/home";
import {Login} from "./components/login";

// console.log(store);


class App extends React.Component {


  render() {

    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Login}/>
          <Route path="/home" component={Home}/>
					<Route render={
						function(){
							return <p>Not Found</p>;
						}
					}/>
        </Switch>
      </BrowserRouter>
    );
  }

}

render(<Provider store={store}>
  <App/>
</Provider>, window.document.getElementById('app'));
