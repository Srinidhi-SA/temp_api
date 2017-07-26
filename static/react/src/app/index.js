import React from "react";
import {render} from "react-dom";
import {Router, Route} from "react-router";

//import {Header} from "./components/Header";
//import {Home} from "./components/Home";

class App extends React.Component {
	render(){
		var user ={
			name: "Manish",
			hobbies: ["Sports", "Reading"]
		};
		return(
		 <div className="container">
		   <div className="row">
		    <div className="col-md-4 col-md-offset-1">
		   </div>
		   </div>
			 <div className="row">
		    <div className="col-md-4 col-md-offset-1">
				<p>kiasldasd</p>
		   </div>
		   </div>
		 </div>
		 );
	}
}

render(<App/>, window.document.getElementById('app'));
