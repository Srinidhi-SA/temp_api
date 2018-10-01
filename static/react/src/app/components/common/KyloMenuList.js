import React from "react";
import {Link} from "react-router-dom";
import {STATIC_URL} from "../../helpers/env";
import {LIST_OF_KYLO_OPERATIONS} from "../../helpers/kyloHelper"
import {hidechatbot,removeChatbotOnLogout} from "../../helpers/helper"

export class KyloMenuList extends React.Component {
  constructor(props) {
    super(props);

  }
  componentWillMount(){
    hidechatbot()
    removeChatbotOnLogout()
  }

  render() {

    console.log("kylo=============")

    const cardListDetails = LIST_OF_KYLO_OPERATIONS.map((card, i) => {
      var iconDetails = "";
      var percentageDetails = "";
      var kyloLink = "/datamgmt/selected_menu/" + card.relative_url;
      var kyloClick =  <span>{card.displayName}</span>
      
      var imgLink = STATIC_URL + "assets/images/"+card.logo
      iconDetails = <img src={imgLink} alt="LOADING"/>

      return (
        <div key={i}>
        <div class="col-xs-6 col-sm-3">
        <div class="newCardStyle icon-container">
            <Link to={kyloLink} id={card.slug} className="title">
			<div class="icon">
              {iconDetails}
            </div>
            <span class="class">{kyloClick}</span>
			</Link>
          </div>
      </div>

    </div>
      )
    });

console.log("from kylo!!!!!!")
console.log(cardListDetails)
    return (
      <div className="side-body">
	  <div className="page-head"><h3 class="xs-mt-0">Data Manage</h3></div>
	  <div className="clearfix"></div>
      <div className="main-content">	  
	  <div className="row">
      {cardListDetails}
	  </div>
      </div>
      </div>
    );
    }
  }
