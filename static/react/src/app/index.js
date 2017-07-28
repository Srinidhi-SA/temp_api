import React from "react";
import {render} from "react-dom";
import {BrowserRouter,Route,Switch} from "react-router-dom";

import {Home} from "./templates/Home";
import {Login} from "./templates/Login";

class App extends React.Component {
	render(){
		return(
		   <BrowserRouter>
			 <Switch>
			    <Route exact path={"/"} component={Login}/>
					<Route path={"/home"} component={Home}/>
				</Switch>
			 </BrowserRouter>
		 );
	}
}

render(<App/>, window.document.getElementById('app'));
