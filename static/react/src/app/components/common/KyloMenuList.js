import React from "react";
import {Link} from "react-router-dom";
import {STATIC_URL} from "../../helpers/env";
import {LIST_OF_KYLO_OPERATIONS} from "../../helpers/kyloHelper"

export class KyloMenuList extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {

    console.log("kylo=============")

    const cardListDetails = LIST_OF_KYLO_OPERATIONS.map((card, i) => {
      var iconDetails = "";
      var percentageDetails = "";
      var kyloLink = "/datamgmt/selected_menu/" + card.relative_url;
      var kyloClick = <Link to={kyloLink} id={card.slug} className="title">
        {card.displayName}
      </Link>
      var imgLink = STATIC_URL + "assets/images/"+card.logo
      iconDetails = <img src={imgLink} alt="LOADING"/>

      return (
        <div key={i}>
        <div class="col-xs-6 col-sm-3">
        <div class="icon-container">
            <div class="icon">
              {iconDetails}
            </div>
            <span class="class">{kyloClick}</span>
          </div>
      </div>

    </div>
      )
    });

console.log("from kylo!!!!!!")
console.log(cardListDetails)
    return (
      <div className="side-body">
      <div style={{marginRight: "-15px",marginLeft: "6px"}}>
      {cardListDetails}
      </div>
      </div>
    );
    }
  }
