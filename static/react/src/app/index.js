import React from "react";
import {render} from "react-dom";
import {BrowserRouter, Route, Switch, IndexRoute} from "react-router-dom";
import {Provider} from "react-redux"
import store from "./store"

import {Main} from "./components/Main";
import {Home} from "./components/Home";
import {Login} from "./components/Login";
//import {Signal} from "./components/Signal";
import {Settings} from "./components/settings/Settings";
import {Apps} from "./components/apps/Apps";
import {Data} from "./components/data/Data";
import {DataPreview} from "./components/data/DataPreview";
import {Stories} from "./components/stories/Stories";
import {Signals} from "./components/signals/Signals";
import {Signal} from "./components/signals/Signal";
import {SignalDocumentMode} from "./components/signals/SignalDocumentMode";
import {OverViewPage} from "./components/signals/overViewPage";
import {VariableSelection} from "./components/signals/variableSelection";
import {DataVariableSelection} from "./components/data/DataVariableSelection";
import {ModelVariableSelection} from "./components/apps/ModelVariableSelection";
import {AppsModelDetail} from "./components/apps/AppsModelDetail";
import {ScoreVariableSelection} from "./components/apps/ScoreVariableSelection";
import {AppsScoreDetail} from "./components/apps/AppsScoreDetail";
import {AppsPanel} from "./components/apps/AppsPanel";
import {AppsScoreList} from "./components/apps/AppsScoreList";
import {RoboInsightList} from "./components/apps/RoboInsightList";
import {RoboDataUploadPreview} from "./components/apps/RoboDataUploadPreview";
import {RoboDocumentMode} from "./components/apps/RoboDocumentMode";
import {Profile} from "./components/common/profile";
import {AudioFileList} from "./components/apps/AudioFileList";
import {AudioFileSummary} from "./components/apps/AudioFileSummary";
import {AppsStockAdvisorList} from "./components/apps/AppsStockAdvisorList";
import {AppsStockDataPreview} from "./components/apps/AppsStockDataPreview";
import {AppsStockDocumentMode} from "./components/apps/AppsStockDocumentMode";
import {DataPreviewLeftPanel} from "./components/data/DataPreviewLeftPanel";
import {ModelAlgorithmSelection} from "./components/apps/ModelAlgorithmSelection";
import {RegressionAppList} from "./components/apps/RegressionAppList";

class App extends React.Component {

  render() {
	  sessionStorage.url = window.location.pathname;

    return (
      <BrowserRouter>
      <Switch>
          <Route exact path="/login" component={Login}/>
          <Main>
            <Route exact path="/" component={Home} />
			<Route exact path="/user-profile" component={Profile} />
            <Route exact path="/signals" component={Signals} />
            {/*<Route exact path="/signals/datapreview/:slug" component={DataPreview} />*/}
            <Route exact path="/signals/:slug" component={Signal}/>
            <Route exact path="/signals/:slug/:l1" component={OverViewPage}/>
            <Route exact path="/signals/:slug/:l1/:l2/:l3" component={OverViewPage}/>
            <Route exact path="/signals/:slug/:l1/:l2" component={OverViewPage}/>
            <Route path="/variableselection" component={VariableSelection} />
            <Route path = "/signaldocumentMode/:slug" component = {SignalDocumentMode}/>
            <Route path="/settings" component={Settings} />
            <Route path="/stories" component={Stories} />
            <Route exact path="/data" component={Data} />
            <Route exact path="/data/:slug" component={DataPreview} />
            <Route exact path="/apps" component={AppsPanel} />
            <Route exact path="/apps?page=:slug" component={AppsPanel} />
            <Route exact path="/apps/:AppId/models" component={Apps} />
            <Route exact path="/apps/:AppId/scores" component={Apps} />
            <Route exact path="/apps/:AppId/models?page=:slug" component={Apps} />
            <Route exact path="/apps/:AppId/scores?page=:slug" component={Apps} />
            <Route exact path="/apps/:AppId/models/data/:slug/createModel" component={ModelVariableSelection} />
            <Route exact path="/apps/:AppId/models/:slug" component={AppsModelDetail} />
            <Route exact path="/apps/:AppId/models/:modelSlug/data/:slug/createScore" component={ScoreVariableSelection} />
            <Route exact path="/data?page=:slug" component={Data} />
            <Route exact path="/apps/:AppId/scores/:slug" component={AppsScoreDetail} />
            <Route exact path="/data/:slug/createSignal" component={VariableSelection}/>
            <Route exact path="/signals?page=:slug" component={Signals}/>
            <Route exact path="/signals?search=:slug" component={Signals}/>
            <Route exact path="/apps/:AppId/models/data/:slug" component={DataPreview} />
            <Route exact path="/apps-robo" component={RoboInsightList} />
            <Route exact path="/apps-robo-list/:roboSlug/:tabName/data/:slug" component={RoboDataUploadPreview} />
            <Route exact path="/apps-robo/:slug/:l1" component={OverViewPage} />
            <Route exact path="/apps-robo/:slug/:l1/:l2" component={OverViewPage} />
            <Route exact path="/apps-robo/:slug/:l1/:l2/:l3" component={OverViewPage} />
            <Route exact path="/apps-robo-document-mode/:slug" component={RoboDocumentMode} />
            <Route exact path="/apps/:AppId/models/:modelSlug/data/:slug" component={DataPreview} />
            <Route exact path="/apps-robo/:roboSlug" component={RoboDataUploadPreview} />
            <Route exact path="/apps-robo-list" component={RoboInsightList} />
            <Route exact path="/apps/audio" component={AudioFileList} />
            <Route exact path="/apps/audio/:audioSlug" component={AudioFileSummary} />
            <Route exact path="/apps/audio?page=:pageNo" component={AudioFileList} />
            <Route exact path="/apps-stock-advisor" component={AppsStockAdvisorList} />
            <Route exact path="/apps-stock-advisor-analyze/data/:slug" component={AppsStockDataPreview} />" +
            <Route exact path="/apps-stock-advisor/:slug" component={OverViewPage}/>
            <Route exact path="/apps-stock-advisor/:slug/:l1" component={OverViewPage}/>
            <Route exact path="/apps-stock-advisor/:slug/:l1/:l2/:l3" component={OverViewPage}/>
            <Route exact path="/apps-stock-advisor/:slug/:l1/:l2" component={OverViewPage}/>
            <Route exact path="/apps-stock-document-mode/:slug" component={AppsStockDocumentMode}/>
            <Route exact path="/apps/:AppId/scores/:slug/dataPreview" component={DataPreviewLeftPanel}/>
            <Route exact path="/apps/:AppId/models/data/:slug/createModel/Proceed" component={ModelAlgorithmSelection}/>
            <Route exact path="/apps-regression" component={RegressionAppList} />
            <Route exact path="/apps-regression-score" component={RegressionAppList} />
            <Route exact path="/apps-regression/scores" component={RegressionAppList} />
            <Route exact path="/apps-regression/models" component={RegressionAppList} />
            <Route exact path="/apps-regression-score/:slug" component={OverViewPage}/>
            <Route exact path="/apps-regression-score/:slug/:l1" component={OverViewPage}/>
            <Route exact path="/apps-regression-score/:slug/:l1/:l2/:l3" component={OverViewPage}/>
            <Route exact path="/apps-regression-score/:slug/:l1/:l2" component={OverViewPage}/>
            <Route exact path="/apps-regression-score-document/:slug" component={SignalDocumentMode}/>

            </Main>
      </Switch>
      </BrowserRouter>
    );
  }

}

render(
  <Provider store={store}>

  <App/>

</Provider>, window.document.getElementById('app'));
