import React from "react";

export default class Login extends React.Component {

	render(){
		return(
		 <div className="container-fluid">
  <div className="row" >new login
    <div className="col-md-4 col-md-offset-7">
      <div className="login_section lg_form">
        <form  method="post">
          <h1><img src="/static/react/assets/images/m_adv_logo_text.png"/></h1>
          <div className="form-group">
            <label for="InputEmail1">Email</label>
             <input type="text" className="form-control" id="InputUserName" />
          </div>
          <div className="form-group">
            <label for="InputPassword1">PASSWORD</label>
            <input type="password" className="form-control" id="InputPassword1" />
          </div>
          <div className="checkbox">
            <label>
                 <input type="checkbox" value="remember-me" id="remember_me" /> Remember me
            </label>
            <div className="ForgotPass"> <a href="/forgot-password">FORGOT PASSWORD ?</a> </div>
          </div>

          <button type="submit" className="btn-default logBtn">Submit</button>
        </form>
      </div>
    </div>
  </div>
</div>

		 );
	}
}
