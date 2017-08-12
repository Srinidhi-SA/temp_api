import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import Breadcrumb from 'react-breadcrumb';
import {Card}from "./Card";

@connect((store) => {
  return {signal:store.signals.signalAnalysis};
})


export class SignalDocumentMode extends React.Component {
  constructor() {
    super();
  }

searchTree(_Node,cardLists,lastVar) {
    if (_Node.listOfCards[_Node.listOfCards.length-1].slug == lastVar) {
      console.log("cardlist if no cards in node:");
      console.log(cardLists);
      cardLists.push(_Node.listOfCards);
      return cardLists;
    } else {
      var i;
      var result = null;
        cardLists.push(_Node.listOfCards);
      for (i = 0;i < _Node.listOfNodes.length; i++) {
        result = this.searchTree(_Node.listOfNodes[i], cardLists,lastVar);
      }
      console.log("cardLists is:");
      console.log(cardLists);
      return result;

  }
}
  render() {

    console.log("document mode is called$$$$$$$$$$$$$$!!");
    console.log(this.props);

    let cardList=[];
    let lastCard = this.props.history.location.state.lastVar;
    cardList=this.searchTree(this.props.signal,cardList,lastCard);
    console.log("card list is...");
    console.log(cardList);
    let docObj = [];
    for (let card of cardList){
      console.log("card is:")
      console.log(card);
      for(let _card of card){
        console.log("_card is :"+_card);
      docObj.push(_card);
    }
    }
    console.log(docObj);
 docObj.splice(0,1);

 let objs = [];
docObj.map(function(item,i){
 let len= item.cardData.length;

  for(var i=0;i<len;i++){
    objs.push(item.cardData[i]);

}

})
console.log(objs);

    if(objs){
      return(
        <div className="side-body">
          <div className="page-head">
            <div class="row">
              <div class="col-md-12">
                <Breadcrumb path={[
                  {
                    path: '/signals',
                    label: 'Signals'
                  }
                ]}/>
              </div>
              <div class="col-md-8">
                <h2>{this.props.signal.name}</h2>
              </div>
            </div>
            <div class="clearfix"></div>
          </div>
          <div className="main-content">
            <Card cardData = {objs}/>
          </div>
        </div>


      );
    }


    return (
      <div className="side-body">
        <div className="page-head">
          <div class="row">
            <div class="col-md-12">
              <Breadcrumb path={[
                {
                  path: '/signals',
                  label: 'Signals'
                }
              ]}/>
            </div>
            <div class="col-md-8">
              <h2>{this.props.signal.name}</h2>
            </div>
          </div>
          <div class="clearfix"></div>
        </div>
        <div className="main-content">
          <img id="loading" src="/assets/images/Preloader_2.gif"/>
        </div>
      </div>
    );
  }
}
