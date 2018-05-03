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
import {getUserDetailsOrRestart} from "./helpers/helper";
import {Redirect} from "react-router-dom";
import {APPS_ALLOWED} from "./helpers/env.js"
import {SampleFrame} from "./components/common/SampleFrame"
import {KyloMenuList} from "./components/common/KyloMenuList"

class App extends React.Component {
  hasSignalRoutePermission() {
    //alert("working!!!")
    if (getUserDetailsOrRestart.get().view_signal_permission == "true")
      return true
    else
      return false
  }
  hasDataRoutePermission() {
    //alert("working!!!")
    if (getUserDetailsOrRestart.get().view_data_permission == "true")
      return true
    else
      return false
  }
  hasTrainerRoutePermission() {
    //check for apps exposure also
    if (getUserDetailsOrRestart.get().view_trainer_permission == "true"&&APPS_ALLOWED==true)
      return true
    else
      return false
  }
  hasScoreRoutePermission() {
    //alert("working!!!")
    if (getUserDetailsOrRestart.get().view_score_permission == "true"&&APPS_ALLOWED==true)
      return true
    else
      return false
  }
  render() {
    sessionStorage.url = window.location.pathname;
    //we need to do like this as BrowserRouter dont pass history and props if we call components directly
    //signal related routing permissions
    const signals = (props) => {
      if (this.hasSignalRoutePermission()) {
        switch (props.match.path) {
          case "/signals":
            {
              return (<Signals {...props}/>)
            }
            break;
          case "/signals/:slug":
            {
              return (<Signal {...props}/>)
            }
            break;
          case "/signals/:slug/:l1":
            {
              return (<OverViewPage {...props}/>)
            }
            break;
          case "/signals/:slug/:l1/:l2/:l3":
            {
              return (<OverViewPage {...props}/>)
            }
            break;
          case "/signals/:slug/:l1/:l2":
            {
              return (<OverViewPage {...props}/>)
            }
            break;
          case "/signaldocumentMode/:slug":
            {
              return (<SignalDocumentMode {...props}/>)
            }
            break;
          case "/signals?page=:slug":
            {
              return (<Signals {...props}/>)
            }
            break;
          case "/signals?search=:slug":
            {
              return (<Signals {...props}/>)
            }
            break;
        }

      } else if (this.hasDataRoutePermission()) {
        return (<Redirect to="/data"/>)
      } else {
        //currently sending it to app, otherwise it should go to Login
        return (<Redirect to="/apps"/>)
      }
    }
    //data related routing permissions
    const data = (props) => {
      if (this.hasDataRoutePermission()) {
        switch (props.match.path) {
          case "/data":
            {
              return (<Data {...props}/>)
            }
            break;
          case "/data/:slug":
            {
              return (<DataPreview {...props}/>)
            }
            break;
          case "data?page=:slug":
            {
              return (<Data {...props}/>)
            }
            break;
          case "/data/:slug/createSignal":
            {
              return (<VariableSelection {...props}/>)
            }
            break;
          case "/apps/:AppId/models/data/:slug":
            {
              return (<DataPreview {...props}/>)
            }
            break;
          case "/apps/:AppId/models/:modelSlug/data/:slug":
            {
              return (<DataPreview {...props}/>)
            }
        }

      } else if (this.hasSignalRoutePermission()) {
        return (<Redirect to="/signals"/>)
      } else {
        //currently sending it to app, otherwise it should go to Login
        return (<Redirect to="/apps"/>)
      }
    }
    //app trainer and score route permission
    const trainer = (props) => {
      if (this.hasTrainerRoutePermission()) {
        switch (props.match.path) {
          case "/apps/:AppId/models":
            {
              return (<Apps {...props}/>)
            }
            break;
          case "/apps/:AppId/models?page=:slug":
            {
              return (<Apps {...props}/>)
            }
            break;
          case "/apps/:AppId/models/:slug":
            {
              return (<AppsModelDetail {...props}/>)
            }
            break;

        }

      } else if (this.hasScoreRoutePermission()) {
        let score_url = "/apps"
        if (props.match.params.AppId)
          score_url = "/apps/" + props.match.params.AppId + "/scores"
        return (<Redirect to={score_url}/>)
      } else {
        return (<Redirect to="/apps"/>)
      }
    }

    const score = (props) => {
      if (this.hasScoreRoutePermission()) {
        switch (props.match.path) {
          case "/apps/:AppId/scores":
            {
              return (<Apps {...props}/>)
            }
            break;
          case "/apps/:AppId/scores?page=:slug":
            {
              return (<Apps {...props}/>)
            }
            break;
          case "/apps/:AppId/scores/:slug":
            {
              return (<AppsScoreDetail {...props}/>)
            }
            break;
          case "/apps/:AppId/scores/:slug/dataPreview":
            {
              return (<DataPreviewLeftPanel {...props}/>)
            }
            break;
        }

      } else if (this.hasTrainerRoutePermission()) {
        let model_url = "/apps"
        if (props.match.params.AppId)
          model_url = "/apps/" + props.match.params.AppId + "/models"
        return (<Redirect to={model_url}/>)
      } else {
        return (<Redirect to="/apps"/>)
      }
    }

    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/login" component={Login}/>
          <Main>
            <Route exact path="/" component={Home}/>
            <Route exact path="/user-profile" component={Profile}/>
            <Route exact path="/signals" render={signals}/> {/*<Route exact path="/signals/datapreview/:slug" component={DataPreview} />*/}
            <Route exact path="/signals/:slug" render={signals}/>
            <Route exact path="/signals/:slug/:l1" render={signals}/>
            <Route exact path="/signals/:slug/:l1/:l2/:l3" render={signals}/>
            <Route exact path="/signals/:slug/:l1/:l2" render={signals}/>
            <Route path="/variableselection" component={VariableSelection}/>
            <Route path="/signaldocumentMode/:slug" render={signals}/>
            <Route path="/settings" component={Settings}/>
            <Route path="/stories" component={Stories}/>
            <Route exact path="/data" render={data}/>
            <Route exact path="/data/:slug" render={data}/>
            <Route exact path="/apps" component={AppsPanel}/>
            <Route exact path="/apps?page=:slug" component={AppsPanel}/>
            <Route exact path="/apps/:AppId/models" render={trainer}/>
            <Route exact path="/apps/:AppId/scores" render={score}/>
            <Route exact path="/apps/:AppId/models?page=:slug" render={trainer}/>
            <Route exact path="/apps/:AppId/scores?page=:slug" render={score}/>
            <Route exact path="/apps/:AppId/models/data/:slug/createModel" component={ModelVariableSelection}/>
            <Route exact path="/apps/:AppId/models/:slug" render={trainer}/>
            <Route exact path="/apps/:AppId/models/:modelSlug/data/:slug/createScore" component={ScoreVariableSelection}/>
            <Route exact path="/data?page=:slug" render={data}/>
            <Route exact path="/apps/:AppId/scores/:slug" render={score}/>
            <Route exact path="/data/:slug/createSignal" render={data}/>
            <Route exact path="/signals?page=:slug" render={signals}/>
            <Route exact path="/signals?search=:slug" render={signals}/>
            <Route exact path="/apps/:AppId/models/data/:slug" render={data}/>
            <Route exact path="/apps-robo" component={RoboInsightList}/>
            <Route exact path="/apps-robo-list/:roboSlug/:tabName/data/:slug" component={RoboDataUploadPreview}/>
            <Route exact path="/apps-robo/:slug/:l1" component={OverViewPage}/>
            <Route exact path="/apps-robo/:slug/:l1/:l2" component={OverViewPage}/>
            <Route exact path="/apps-robo/:slug/:l1/:l2/:l3" component={OverViewPage}/>
            <Route exact path="/apps-robo-document-mode/:slug" component={RoboDocumentMode}/>
            <Route exact path="/apps/:AppId/models/:modelSlug/data/:slug" render={data}/>
            <Route exact path="/apps-robo/:roboSlug" component={RoboDataUploadPreview}/>
            <Route exact path="/apps-robo-list" component={RoboInsightList}/>
            <Route exact path="/apps/audio" component={AudioFileList}/>
            <Route exact path="/apps/audio/:audioSlug" component={AudioFileSummary}/>
            <Route exact path="/apps/audio?page=:pageNo" component={AudioFileList}/>
            <Route exact path="/apps-stock-advisor" component={AppsStockAdvisorList}/>
            <Route exact path="/apps-stock-advisor-analyze/data/:slug" component={AppsStockDataPreview}/>" +
            <Route exact path="/apps-stock-advisor/:slug" component={OverViewPage}/>
            <Route exact path="/apps-stock-advisor/:slug/:l1" component={OverViewPage}/>
            <Route exact path="/apps-stock-advisor/:slug/:l1/:l2/:l3" component={OverViewPage}/>
            <Route exact path="/apps-stock-advisor/:slug/:l1/:l2" component={OverViewPage}/>
            <Route exact path="/apps-stock-document-mode/:slug" component={AppsStockDocumentMode}/>
            <Route exact path="/apps/:AppId/scores/:slug/dataPreview" render={score}/>
            <Route exact path="/apps/:AppId/models/data/:slug/createModel/Proceed" component={ModelAlgorithmSelection}/>
            <Route exact path="/apps-regression" component={RegressionAppList}/>
            <Route exact path="/apps-regression-score" component={RegressionAppList}/>
            <Route exact path="/apps-regression/scores" component={RegressionAppList}/>
            <Route exact path="/apps-regression/models" component={RegressionAppList}/>
            <Route exact path="/apps-regression-score/:slug" component={OverViewPage}/>
            <Route exact path="/apps-regression-score/:slug/:l1" component={OverViewPage}/>
            <Route exact path="/apps-regression-score/:slug/:l1/:l2/:l3" component={OverViewPage}/>
            <Route exact path="/apps-regression-score/:slug/:l1/:l2" component={OverViewPage}/>
            <Route exact path="/apps-regression-score-document/:slug" component={SignalDocumentMode}/>
            <Route exact path="/kylo" component={KyloMenuList}/>
            <Route exact path="/kylo/selected_menu/:kylo_url" component={SampleFrame}/>

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
