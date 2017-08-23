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

class App extends React.Component {

  render() {

    return (
      <BrowserRouter>
      <Switch>
          <Route exact path="/login" component={Login}/>
          <Main>
            <Route exact path="/" component={Home} />
            <Route exact path="/signals" component={Signals} />
            {/*<Route exact path="/signals/datapreview/:slug" component={DataPreview} />*/}
            <Route exact path="/signals/:slug" component={Signal}/>
            <Route exact path="/signals/:slug/:l1" component={OverViewPage}/>
            <Route exact path="/signals/:slug/:l1/:l2/:l3" component={OverViewPage}/>
            <Route exact path="/signals/:slug/:l1/:l2" component={OverViewPage}/>
            <Route path="/variableselection" component={VariableSelection} />
            <Route path = "/signaldocumentMode/:slug" component = {SignalDocumentMode}/>
            <Route path="/settings" component={Settings} />
            <Route exact path="/apps" component={AppsPanel} />
            <Route path="/stories" component={Stories} />
            <Route exact path="/data" component={Data} />
            <Route exact path="/data/:slug" component={DataPreview} />
            <Route exact path="/apps/createModel" component={ModelVariableSelection} />
            <Route exact path="/apps/models/:slug" component={AppsModelDetail} />
            <Route exact path="/apps/createScore" component={ScoreVariableSelection} />
            <Route exact path="/data/page/:slug" component={Data} />
            <Route exact path="/apps/:slug/models?page=:slug" component={Apps} />
            <Route exact path="/apps/:slug/score?page=:slug" component={Apps} />
            <Route exact path="/apps/score/:slug" component={AppsScoreDetail} />
            <Route exact path="/data/preview/createSignal" component={VariableSelection}/>
            <Route exact path="/signals?page=:slug" component={Signals}/>
            <Route exact path="/apps/:slug/models" component={Apps} />
            <Route exact path="/apps/:slug/scores" component={Apps} />
            		
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
