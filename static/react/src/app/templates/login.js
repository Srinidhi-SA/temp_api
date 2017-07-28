import React from "react";
import fetch from "isomorphic-fetch";
import {authenticateFunc, getList} from "../../services/ajax.js";
import {BrowserRouter,Route,Switch, withRouter} from "react-router-dom";
export class Login extends React.Component {
   constructor(){
     super();
     var that = this;
    //  this.state={
    //    list: null
    //  };

   }

  doAuth(){
    var that = this;
     authenticateFunc();
  }
  render(){

    return(
      <div className="ma-splash-screen">
      <div className="ma-wrapper am-login">
       <div className="ma-content">
       <div className="main-content">

         <div className="login-container">
           <div className="panel panel-default">
             <div className="panel-heading"><img src="assets/images/m_adv_logo_text.png" alt="logo" className="logo-img" /></div>
             <div className="panel-body">


                 <h3>SIGN IN</h3>
                 <div className="login-form">
                   <div className="form-group">
                     <div className="input-group">
                       <input id="username" type="text" placeholder="Username" autoComplete="off" className="form-control"/><span className="input-group-addon"><i className="fa fa-user"></i></span>
                     </div>
                   </div>
                   <div className="form-group">
                     <div className="input-group">
                       <input id="password" type="password" placeholder="Password" className="form-control" />
                       <span className="input-group-addon"><i className="fa fa-key"></i></span>
                     </div>
                   </div>
          <div className="form-group footer row">
           <div className="col-xs-6 remember text-left">
                       <div className="ma-checkbox">
                         <input type="checkbox" id="remember" className="needsclick" />
                         <label htmlFor="remember"></label>
                       </div>
           <label htmlFor="remember">Remember Me</label>

                     </div>
                     <div className="col-xs-6 text-right"><a href="#">Forgot Password?</a></div>

                   </div>
                   <div className="form-group login-submit">
                     <button onClick={this.doAuth} className="btn btn-primary btn-lg">SIGN IN</button>
                   </div>

                 </div>
               
             </div>
           </div>
     </div>

       </div>
     </div>
   </div>
</div>


    );

  }

}

// Home.propTypes = {
//   name: React.PropTypes.string,
//   age: React.PropTypes.number,
//   user: React.PropTypes.object,
//   children: React.PropTypes.element.isRequired
// };
