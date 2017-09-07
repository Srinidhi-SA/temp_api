import React from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import store from "../../store";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {AppsCreateScore} from "./AppsCreateScore";
import {Card} from "../signals/Card";
import {getListOfCards,getAppsModelSummary} from "../../actions/appActions";
import {storeSignalMeta,hideDataPreview} from "../../actions/dataActions";
import CircularProgressbar from 'react-circular-progressbar';
import {STATIC_URL} from "../../helpers/env.js"
import {isEmpty} from "../../helpers/helper";

@connect((store) => {
	return {login_response: store.login.login_response, 
		currentAppId:store.apps.currentAppId,
		roboUploadTabId:store.apps.roboUploadTabId,
		signal: store.signals.signalAnalysis,
		roboDatasetSlug:store.apps.roboDatasetSlug,
		};
})


export class RoboDocumentMode extends React.Component {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
		this.props.dispatch(hideDataPreview());
	}

  render() {
    console.log("apps Robo Detail View is called##########3");
   /* return (<div className="side-body">
    <div className="main-content">
    <div className="row">
    <div className="col-md-offset-1 col-md-10">
    <h4 className="txt-justify"><b>mAdvisor</b> has analysed your investment portfolio over the <b>last 6 months</b>. 
    Please find the insights from our analysis in the next section.</h4>
    <img src="http://madvisor.marlabsai.com/static/robo/1.png" />
    <h3>Portfolio snapshot</h3>
    <img src="http://madvisor.marlabsai.com/static/robo/2.png" />
    <p className="txt-justify">The portfolio has a <b>very high exposure to equity</b>, as it has almost <b>two-thirds</b> 66.0% of the total investment.And it is diversified across <b>Large Cap</b> and <b>Multi Cap</b>, with INR 406779 and INR 565693 respectively.</p>
    <p className="txt-justify">The portfolio has very <b>little</b> exposure to <b>debt</b> 
    instruments.The debt portion of the portfolio accounts for about <b>28.0%</b> of the total investment.And, the entire debt portfolio is solely focused on <b>Ultra Short Term</b></p><h3>How is your portfolio performing ?</h3>
   <div className="text-center"> <img src="http://madvisor.marlabsai.com/static/robo/3.png" /></div>
   
   
   <p className="txt-justify">The portfolio, with the <b>total investment</b> of INR <b>1388090</b>, is now worth INR <b>1483910</b> This indicates a <b>moderate growth</b> of <b>1.07%</b> over the last 6 months. </p>
   <p className="txt-justify" >The portfolio <b>shrunk significantly</b> between <b>Sep and Nov</b>, and remained <b>relatively flat</b> since then. It has <b>outperformed</b> the benchmark index sensex, with most of the gain made during Jun and Aug. </p>

   <h3>What is driving your protfolio growth ?</h3>
   <p className="txt-justify" >You have been investing in 6 mutual funds (1 Debt,1 Cash,4 Equity).4 have grown over the last 6 months while remaining 1 has shrunken </p>
   <div className="text-center"> <img src="http://madvisor.marlabsai.com/static/robo/4.png" /></div>

   <h4><u>Outperformers</u></h4>

   <p className="txt-justify" > The most significant among them is <b>IDFC - Premier Equity Fund Reg (G)</b> from Equity portfolio, which has grown by 5.05% during the 6 month period, resulting in CAGR of 10.1%. and the next best fund is IDFC - Cash Fund Reg (G) and it has grown by 0.02% during the 6 month period, resulting in CAGR of 0.04% .
   </p>

   <h4><u>Underperformers</u></h4>
   <p className="txt-justify" ><b>Franklin - India Bluechip Fund (G) and Franklin - India Ultra Short Bond Super Ins (G)</b> Funds have been under-performing over the last 6 month, growing just around -0.9% and 0.0%.</p>

   <h1>What is the effect of targeted sector allocation?</h1>
   <div className="text-center"> <img src="http://madvisor.marlabsai.com/static/robo/5.png" /></div>
   <p className="txt-justify" >The portfolio seems to be well diversified as investments have been made in a wide range of sectors. However, the investments in equity market seem to <b>depend heavily upon couple of sectors</b>, as Financial Services and FMCG accounts for more than <b>half</b> 50.0% of the equity allocation.</p>


   influence of sectors on portfolio growth

   <div className="text-center">  <img src="http://madvisor.marlabsai.com/static/robo/heatmap.png" /></div>

   <p className="txt-justify" >The table below displays the sector allocation of all equity funds and how each sector has performed over the last 6 months. The key sectors that the portfolio is betting on, have done <b>relatively well</b> (Financial Services and FMCG have grown by  22.0% and 28.0% respectively).</p>

   <h3>How is the portfolio projected to perform</h3>
   <p><b>Telecom, Financial Services and Technology</b> are expected to <b>outperform</b> the overall market, whereas <b>Automobile,Oil &amp; Gas and Metals</b> are very likely to <b>remain stable</b>, On the other hand, <b>Consumer Durables,Construction and FMCG</b> seems to <b>underperform</b> compared to other sectors. The chart below displays the sector allocation of the current portfolio, mapped with projected outlook for the sectors.s</p>

   <div className="text-center"> <img src="http://madvisor.marlabsai.com/static/robo/6.png" /></div>

   <h3>Our recommendations to maximize your wealth</h3>
   <div >          
   <p className="txt-justify" >Based on analysis of your portfolio composition, performance of various funds, and the projected outlook, mAdvisor recommends the following.</p>

   <ul>
       <li ><b>Reallocate investments</b> from some of the low-performing assets such as Franklin - India Ultra Short Bond Super Ins (G): Our suggestion is that you can maximize returns by investing more in other existing equity funds.</li>
       <li >Invest in funds that are going to outperform, <b>Technology and Telecom</b> equity funds. Our suggestion is that you consider investing in ICICI Prudential Large Cap Fund, top performer in Technology, which has an annual return of 25.4%.</li>
       <li ><b>Consider investing in Tax Saver</b> equity funds that would help you manage taxes more effectively and save more money.</li>
       
   </ul>
   </div>
    </div>
    </div>
    </div>
    </div>
    );*/
    
    const roboSummary = store.getState().signals.signalAnalysis;
	if (!$.isEmptyObject(roboSummary)) {
		let firstSlug = this.props.signal.slug;
	    let cardModeLink = "/apps-robo/" + store.getState().apps.roboDatasetSlug + "/"+ firstSlug;
		console.log(this.props)
		let listOfCardList = getListOfCards(roboSummary.listOfCards)
		let cardDataList = listOfCardList.map((data, i) => {
			 return (<Card key={i} cardData={data} />)
		                    });
		if(listOfCardList){
			return (
			          <div className="side-body">
			          
			          <div className="main-content">
			          <div className="row">
		                <div className="col-md-12">
		                 
		                <div className="panel panel-mAd documentModeSpacing ">
		                    <div className="panel-heading">
		                      <h2>{store.getState().apps.roboSummary.name}</h2>
		                     
		                      <div className="btn-toolbar pull-right">
		                        <div className="btn-group btn-space">
		                        <Link className="tabs-control right grp_legends_green continue" to={cardModeLink}>
		                          <button type="button" className="btn btn-default" title="Card mode">
		                            <i className="pe-7s-display2 pe-lg"></i>
		                          </button>
		                          </Link>
		                          <button type="button" className="btn btn-default" disabled = "true" title="Document Mode">
		                              <i className="pe-7s-news-paper pe-lg"></i>
		                            </button>
							   <Link className="tabs-control right grp_legends_green continue" to="/apps-robo">
		                          <button type="button" className="btn btn-default">
		                            <i className="pe-7s-close pe-lg"></i>
		                          </button>
								 </Link>
		                        </div>
		                      </div>
		                      
		                      <div className="clearfix"></div>
		                    </div>
		                   <div className="panel-body">
		                   <div className="row-fluid"> 
		           
		                  {cardDataList}

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

	else{
		return (
	
		      <div className="side-body">
		        <div className="page-head">
		        </div>
		        <div className="main-content">
		          <img id="loading" src={ STATIC_URL + "assets/images/Preloader_2.gif" } />
		        </div>
		      </div>
		    );
	}
    
  }
}
