import React from "react";

export class Home extends React.Component {

  render(){
    console.log(this.props);
      var text= "Something";
    return(

       <div>
          <p>In a new Component!</p>
            <p>{text}</p>

       </div>
    );

  }

}
