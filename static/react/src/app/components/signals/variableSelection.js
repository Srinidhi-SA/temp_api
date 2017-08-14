import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import store from "../../store";

import {openCreateSignalModal,closeCreateSignalModal} from "../../actions/createSignalActions";

var dataSelection= {
     "metaData" : [   {"name": "Rows", "value": 30, "display":true},
                      {"name": "Measures", "value": 10, "display":true},
                     {"name": "Dimensions", "value": 5, "display":true},
                     {"name": "Ignore Suggestion", "value": 20, "display":false}
                 ],

    "columnData" : [{
			"name": "Age",
			"slug": "age_a",
			"columnStats":[ {"name": "Mean", "value":100}, {"name": "Sum", "value":1000}, {"name": "Min", "value":0},
							 {"name": "Max", "value":1000}	],
			"chartData" : {
                      "data": {
                  "columns": [
                      ['data1', 30, 200, 100, 400, 150, 250]

                  ],
                  "type": 'bar'
              },
              "size": {
                "height": 200
              },
              "legend": {
                 "show": false
               },
              "bar": {
                  "width": {
                      "ratio": 0.5
                  }

              }
          },
			"columnType": "measure"
      },
  	  {
  			"name": "Name",
  			"slug": "name_a",
  			"columnStats":[ {"name": "Mean", "value":200}, {"name": "Sum", "value":2000}, {"name": "Min", "value":0},
  							 {"name": "Max", "value":1000}	],
  			"chartData" : {
                        "data": {
                    "columns": [
                        ['data1', 30, 200, 100, 400, 150, 750]

                    ],
                    "type": 'bar'
                },
                "size": {
                  "height": 200
                },
                "legend": {
                "show": false
              },
                "bar": {
                    "width": {
                        "ratio": 0.5
                    }

                }
            },
  			"columnType": "dimension"
      },
      {
  			"name": "Sale Date",
  			"slug": "sale_a",
  			"columnStats":[ {"name": "Mean", "value":1100}, {"name": "Sum", "value":1030}, {"name": "Min", "value":0},
  							 {"name": "Max", "value":1000}	],
  			"chartData" : {
                        "data": {
                    "columns": [
                        ['data1', 30, 200, 100, 400, 950, 250]

                    ],
                    "type": 'bar'
                },
                "size": {
                  "height": 200
                },
                "legend": {
                   "show": false
                 },
                "bar": {
                    "width": {
                        "ratio": 0.5
                    }

                }
            },
  			"columnType": "datetime"
        }],
    "headers" :[
        {   "name": "Age",
          "slug" : "age_a" },
		  {   "name": "Name",
          "slug" : "name_a", },
          {   "name": "Sale Date",
              "slug" : "sale_a", }

      ],
    "sampleData" :[[20,30,'20/01/1990'],
	               [33,44,'10/01/1990'],
				   [24,33,'30/01/1990'],
				   [44,36,'20/02/1990']]
};

var selectedVariables = {measures:[],dimensions:[],date:null};  // pass selectedVariables to config

@connect((store) => {
	return {login_response: store.login.login_response,
		newSignalShowModal: store.signals.newSignalShowModal,
		dataList: store.datasets.dataList};
})

export class VariableSelection extends React.Component {
	constructor(props) {
		super(props);
    this.state={
      countOfSelected:0,
      radioChecked:"rad_dt0"
    };
	}



componentDidMount(){
  var that = this;
 $(function(){
   selectedVariables.date = $("#rad_dt0").val();
    $("[type='radio']").click(function(){
        // let count=0;
         let id=$(this).attr("id");

        selectedVariables.date = $("#"+id).val();
         that.setState(previousState => {
          return {radioChecked:id
                    };
        });
        console.log(selectedVariables);
      //  $("#"+id).prop("checked", true);

    });

   $("#mea").click(function(){   // select all measure clicked
     let count=0;
      if($(this).is(":checked")){
        $('.measure[type="checkbox"]').prop('checked', true);
      }else{
        $('.measure[type="checkbox"]').prop('checked', false);
      }
      selectedVariables.dimensions=[];
      $('.dimension[type="checkbox"]').each(function(){

         if($(this).is(":checked")){
           count++;
           selectedVariables.dimensions.push($(this).val());
         }
      });

      selectedVariables.measures=[];
      $('.measure[type="checkbox"]').each(function(){

         if($(this).is(":checked")){
           count++;
           selectedVariables.measures.push($(this).val());
         }
      });

      // if($('input:radio[name="date_type"]').is("checked")){
      //   alert("working");
      //   count++;
      // }
      console.log(selectedVariables);

      that.setState(previousState => {
       return { countOfSelected: count};
     });
   });

   $("#dim").click(function(){     // select all dimension clicked
     let count=0;
      if($(this).is(":checked")){
         $('.dimension[type="checkbox"]').prop('checked', true);
      }else{
         $('.dimension[type="checkbox"]').prop('checked', false);
      }

      selectedVariables.dimensions=[];
      $('.dimension[type="checkbox"]').each(function(){

         if($(this).is(":checked")){
           count++;
           selectedVariables.dimensions.push($(this).val());
         }
      });
      selectedVariables.measures=[];
      $('.measure[type="checkbox"]').each(function(){

         if($(this).is(":checked")){
           count++;
           selectedVariables.measures.push($(this).val());
         }
      });

    console.log(selectedVariables);

      that.setState(previousState => {
       return { countOfSelected: count};
     });

   });

$('.measure[type="checkbox"]').click(function(){
  let count = 0;
  selectedVariables.measures=[];
  $('.measure[type="checkbox"]').each(function(){
     if(!$(this).is(":checked")){
       $('#mea[type="checkbox"]').prop('checked',false);
     }else{

       count++;
        selectedVariables.measures.push($(this).val());
     }
  });
  selectedVariables.dimensions=[];
  $('.dimension[type="checkbox"]').each(function(){

     if(!$(this).is(":checked")){
       $('#mea[type="checkbox"]').prop('checked',false);
     }else{

       count++;
       selectedVariables.dimensions.push($(this).val());
     }
  });

 console.log(selectedVariables);

  that.setState(previousState => {
   return { countOfSelected: count};
 });

});

$('.dimension[type="checkbox"]').click(function(){
  let count=0;
   selectedVariables.dimensions=[];
  $('.dimension[type="checkbox"]').each(function(){
     if(!$(this).is(":checked")){
       $('#dim[type="checkbox"]').prop('checked',false);
     }else{

       count++;
       selectedVariables.dimensions.push($(this).val());
     }
  });
   selectedVariables.measures=[];
  $('.measure[type="checkbox"]').each(function(){
     if(!$(this).is(":checked")){
       $('#mea[type="checkbox"]').prop('checked',false);
     }else{

       count++;
        selectedVariables.measures.push($(this).val());
     }
  });

   console.log(selectedVariables);

  that.setState(previousState => {
   return { countOfSelected: count};
 });
});

 });

}

	render() {
		//const dataSets = store.getState().datasets.dataList.data;
    const metaData = dataSelection.columnData;
    var measures =[], dimensions =[],datetime =[];
    metaData.map((metaItem,metaIndex)=>{
      console.log(metaItem)
      switch(metaItem.columnType){
        case "measure":
         //m[metaItem.slug] = metaItem.name;
         measures.push(metaItem.name);
         //m={};
         break;
        case "dimension":
         dimensions.push(metaItem.name);
        break;
        case "datetime":
          datetime.push(metaItem.name);
        break;
      }

    });

  if(measures.length>0){
  var measureTemplate = measures.map((mItem,mIndex)=>{
      const mId = "chk_mea" + mIndex;
      return(
        <li key={mIndex}><div className="ma-checkbox inline"><input id={mId} type="checkbox" className="measure" value={mItem}/><label htmlFor={mId} className="radioLabels">{mItem}</label></div> </li>
      );
  });
}else{
  var measureTemplate =  <label>No measure variable present</label>
}

if(dimensions.length>0){
  var dimensionTemplate = dimensions.map((dItem,dIndex)=>{
      const dId = "chk_dim" + dIndex;
    return(
     <li key={dIndex}><div className="ma-checkbox inline"><input id={dId} type="checkbox" className="dimension" value={dItem}/><label htmlFor={dId}>{dItem}</label></div> </li>
   );
  });
}else{
  var dimensionTemplate =  <label>No dimension variable present</label>
}

if(datetime.length>0){
  var datetimeTemplate = datetime.map((dtItem,dtIndex)=>{
    const dtId = "rad_dt" + dtIndex;
  return(
   <li key={dtIndex}><div className="ma-radio inline"><input type="radio" checked={this.state.radioChecked === dtId} name="date_type" id={dtId} value={dtItem}/><label htmlFor={dtId}>{dtItem}</label></div></li>
 );
  });
}else{
  var datetimeTemplate = <label>No dates variable present</label>
}

		return (
      <div className="main_wrapper">
          {/*<!-- Header Menu -->*/}
         <nav className="navbar navbar-default navbar-fixed-top" role="navigation">
            {/*<!-- Brand and toggle get grouped for better mobile display -->*/}
            <div className="navbar-header">
               <div className="brand-wrapper">
                {/*  <!-- Hamburger -->*/}
                  <button type="button" className="navbar-toggle"> <span className="sr-only">Toggle navigation</span> <span className="icon-bar"></span> <span className="icon-bar"></span> <span className="icon-bar"></span> </button>
                  {/* <!-- Brand -->*/}
                  <div className="brand-name-wrapper"> <a className="navbar-brand" href="#"></a> </div>
               </div>
            </div>
            <div className="dropdown ma-user-nav">
               <a className="dropdown-toggle" href="#" data-toggle="dropdown"> <i className="avatar-img img-circle">M</i> <img src="images/avatar.jpg" alt="M" className="avatar-img img-circle hide" /><span className="user-name">Marlabs BI</span> <span className="caret"></span></a>
               <ul className="dropdown-menu dropdown-menu-right">
                  <li><a href="profile.html">Profile</a></li>
                  <li><a href="login.html">Logout</a></li>
               </ul>
            </div>
            <div className="clearfix"></div>
         </nav>
        {/*  <!--/.Header Menu -->*/}
         {/* <!-- Side bar Main Menu -->*/}
         <div className="side-menu">
            <div className="side-menu-container">
               <ul className="nav navbar-nav">
                  <li><a href="dashboard.html" className="sdb_signal"> <span></span> SIGNAL</a></li>
                  <li><a href="story.html" className="sdb_story"> <span></span> STORY</a></li>
                  <li><a href="apps.html" className="sdb_app"> <span></span> APPS</a></li>
                  <li className="active"><a href="data.html" className="sdb_data"> <span></span> DATA</a></li>
                  <li><a href="settings.html" className="sdb_settings"> <span></span> SETTINGS</a></li>
               </ul>
            </div>
          {/*}  <!-- /.Side bar Main Menu  -->*/}
         </div>
         {/*<!-- ./Side bar Main Menu -->*/}
         {/*<!-- Main Content starts with side-body -->*/}
         <div className="side-body">
          {/*  <!-- Page Title and Breadcrumbs -->*/}
            <div className="page-head">
            {/*   <!-- <ol className="breadcrumb">
                  <li><a href="#">Story</a></li>
                  <li className="active">Sales Performance Report</li>
                  </ol> -->*/}
               <div className="row">
                  <div className="col-md-8">
                     <h2>Variable Selection</h2>
                  </div>
               </div>
               <div className="clearfix"></div>
            </div>
          {/*  <!-- /.Page Title and Breadcrumbs -->*/}
          {/*  <!-- Page Content Area -->*/}
            <div className="main-content">
        <div className="panel panel-default">
          <div className="panel-body">

          <div className="row">
          <div className="col-lg-4">
              <div className="form-group">
                <input type="text" name="createSname" id="createSname" className="form-control input-sm" placeholder="Create Signal Name" />
              </div>
          </div>{/*<!-- /.col-lg-4 -->*/}
          <div className="col-lg-4">
              <div className="form-group">
                <select className="form-control" id="selectAnalyse">
                  <option>I want to Analyse</option>
                  <option>I want to Analyse 2</option>
                  <option>I want to Analyse 3</option>
                  <option>I want to Analyse 4</option>
                </select>
              </div>
          </div>{/*<!-- /.col-lg-4 -->*/}
          </div>{/*<!-- /.row -->*/}
          <div className="row">
          <div className="col-lg-4">
              <label>Including the follwing variables:</label>
          </div>{/*<!-- /.col-lg-4 -->*/}
          </div>
  {/*<!-------------------------------------------------------------------------------->*/}
          <div className="row">
          <div className="col-lg-4">
            <div className="panel panel-primary panel-borders cst-panel">
            <div className="panel-heading"><i className="pe-7s-graph1"></i> Measures</div>
            <div className="panel-body">
            {/*  <!-- Row for select all-->*/}
              <div className="row">
                <div className="col-md-4">
                  <div className="ma-checkbox inline">
                  <input id="mea" type="checkbox" className="measureAll" />
                  <label htmlFor="mea">Select All</label>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="input-group pull-right">
                  <input type="text" name="search_signals" title="Search Signals" id="search_signals" className="form-control" placeholder="Search signals..." />
                  <span className="input-group-addon"><i className="fa fa-search fa-lg"></i></span>
                  <span className="input-group-btn">
                  <button type="button" data-toggle="dropdown" title="Sorting" className="btn btn-default dropdown-toggle" aria-expanded="false"><i className="fa fa-sort-alpha-asc fa-lg"></i> <span className="caret"></span></button>
                  <ul role="menu" className="dropdown-menu dropdown-menu-right">
                  <li><a href="#">Name Ascending</a></li>
                  <li><a href="#">Name Descending</a></li>
                  <li><a href="#">Date Ascending</a></li>
                  <li><a href="#">Date Descending</a></li>
                  </ul>
                  </span>
                  </div>
                </div>
              </div>
            {/*  <!-- End -->*/}
              <hr />
            {/*  <!-- Row for list of variables-->*/}
              <div className="row">
                <div className="col-md-12">
                  <ul className="list-unstyled">
                      {measureTemplate}
                  </ul>
                </div>
              </div>
            {/*  <!-- End Row for list of variables-->*/}
            </div>
            </div>

          </div>{/*<!-- /.col-lg-4 -->*/}
          <div className="col-lg-4">
              <div className="panel panel-primary panel-borders cst-panel">
              <div className="panel-heading"><i className="pe-7s-graph1"></i> Dimensions</div>
                <div className="panel-body">
                  {/*  <!-- Row for select all-->*/}
                    <div className="row">
                      <div className="col-md-4">
                        <div className="ma-checkbox inline">
                        <input id="dim" type="checkbox" className="dimensionAll"/>
                        <label htmlFor="dim">Select All</label>
                        </div>
                      </div>
                    <div className="col-md-8">
                      <div className="input-group pull-right">
                      <input type="text" name="search_signals" title="Search Signals" id="search_signals" className="form-control" placeholder="Search signals..." />
                      <span className="input-group-addon"><i className="fa fa-search fa-lg"></i></span>
                      <span className="input-group-btn">
                      <button type="button" data-toggle="dropdown" title="Sorting" className="btn btn-default dropdown-toggle" aria-expanded="false"><i className="fa fa-sort-alpha-asc fa-lg"></i> <span className="caret"></span></button>
                      <ul role="menu" className="dropdown-menu dropdown-menu-right">
                      <li><a href="#">Name Ascending</a></li>
                      <li><a href="#">Name Descending</a></li>
                      <li><a href="#">Date Ascending</a></li>
                      <li><a href="#">Date Descending</a></li>
                      </ul>
                      </span>
                      </div>
                    </div>
                    </div>
                  {/*  <!-- End -->*/}
                    <hr />
                  {/*  <!-- Row for list of variables-->*/}
                    <div className="row">
                    <div className="col-md-12">
                      <ul className="list-unstyled">
                           {dimensionTemplate}
                      </ul>
                    </div>
                    </div>
                  {/*  <!-- End Row for list of variables-->*/}


                </div>
              </div>


          </div>{/*<!-- /.col-lg-4 -->*/}
          <div className="col-lg-4">
              <div className="panel panel-primary panel-borders cst-panel">
            <div className="panel-heading"><i className="pe-7s-date"></i> Dates</div>
            <div className="panel-body">

            {/*  <!-- Row for options all-->*/}
                    <div className="row">
                      <div className="col-md-4">

                      </div>
                    <div className="col-md-8">
                      <div className="input-group pull-right">
                      <input type="text" name="search_signals" title="Search Signals" id="search_signals" className="form-control" placeholder="Search signals..."/>
                      <span className="input-group-addon"><i className="fa fa-search fa-lg"></i></span>
                      <span className="input-group-btn">
                      <button type="button" data-toggle="dropdown" title="Sorting" className="btn btn-default dropdown-toggle" aria-expanded="false"><i className="fa fa-sort-alpha-asc fa-lg"></i> <span className="caret"></span></button>
                      <ul role="menu" className="dropdown-menu dropdown-menu-right">
                      <li><a href="#">Name Ascending</a></li>
                      <li><a href="#">Name Descending</a></li>
                      <li><a href="#">Date Ascending</a></li>
                      <li><a href="#">Date Descending</a></li>
                      </ul>
                      </span>
                      </div>
                    </div>
                    </div>
                    {/*<!-- End Row for options all -->*/}
                    <hr />
                      {/*<!-- Row for list of variables-->*/}
                    <div className="row">
                    <div className="col-md-12">

                      <ul className="list-unstyled">
                                {datetimeTemplate}
                      </ul>
                    </div>
                    </div>
                      {/*<!-- End Row for list of variables-->*/}

            </div>
            </div>
          </div>{/*<!-- /.col-lg-4 -->*/}
          </div>  {/*<!-- /.row -->*/}
{/*<!-------------------------------------------------------------------------------->*/}
          <div className="row">
            <div className="col-md-4 col-md-offset-5">
                <h4>{this.state.countOfSelected} Variable selected <a href="#"><i className="pe-7s-more pe-2x pe-va"></i></a></h4>
            </div>
          </div>
          <div className="row">
            <div className="col-md-8 col-md-offset-2">
              <div className="panel panel-primary panel-borders cst-panel">
                <div className="panel-heading">Performing the following Analysis</div>
                <div className="panel-body">
                  <div className="ma-checkbox inline"><input id="chk_analysis1" type="checkbox" className="needsclick"/><label htmlFor="chk_analysis1">Frequency Distribution </label></div>
                  <div className="ma-checkbox inline"><input id="chk_analysis2" type="checkbox" className="needsclick"/><label htmlFor="chk_analysis2">Trend </label></div>
                  <div className="ma-checkbox inline"><input id="chk_analysis3" type="checkbox" className="needsclick"/><label htmlFor="chk_analysis3">Chi Sq </label></div>
                  <div className="ma-checkbox inline"><input id="chk_analysis4" type="checkbox" className="needsclick"/><label htmlFor="chk_analysis4">Decision Tree</label></div>
                  <hr/>
                  <div className="ma-checkbox inline"><input id="chk_results" type="checkbox" className="needsclick"/><label htmlFor="chk_results">Statistically Significant Results</label></div>
                  <a href="javascript:;" className="pull-right">Go to advanced settings</a></div>
                </div>
              </div>
          </div>

          <div className="row">
            <div className="col-md-12 text-center">
              <button className="btn btn-primary">CREATE SIGNAL</button>
            </div>
          </div>


          </div>
        </div>
            </div>
              {/*<!-- /.Page Content Area -->*/}
         </div>
           {/*<!-- /. Main Content ends with side-body -->*/}
      </div>
		)
	}

}
