import React from "react";
import {render} from "react-dom";
import {BrowserRouter as Router, Route, Switch, Link , IndexRoute} from "react-router-dom";

import {Login} from "./login";


class App extends React.Component {
	render(){

	return (
	    <Router>
	        <Route path="/" component={Login} />
	    </Router>
	);
	}

}

render(<App/>, window.document.getElementById('app'));
