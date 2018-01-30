import React from "react";

import {BreadCrumb} from "./BreadCrumb";

export class OverViewTabs extends React.Component {

  render() {
    console.log("in overviewtabs")
    return (
      <div class="row">
        <div class="col-md-12">
          <div class="panel panel-mAd">
            <div class="panel-heading">
              <h2 class="pull-left">Sales Performance Report</h2>
              <div class="btn-toolbar pull-right">
                <div class="btn-group btn-space">
                  <button type="button" class="btn btn-default"><i class="fa fa-file-pdf-o"></i></button>
                  <button type="button" class="btn btn-default"><i class="fa fa-print"></i></button>
                  <button type="button" class="btn btn-default"><i class="fa fa-times"></i></button>
                </div>
              </div>
              <div class="clearfix"></div>
            </div>
            <div class="panel-body no-border">
              <div class="card full-width-tabs">
                <ul class="nav nav-tabs" id="guide-tabs" role="tablist">
                  <li class="active"><a href="#overview" aria-controls="overview" role="tab" data-toggle="tab"><i class="mAd_icons tab_overview"></i><span>Overview</span></a></li>
                  <li><a href="#trend" aria-controls="trend" role="tab" data-toggle="tab"><i class="mAd_icons tab_trend"></i><span>Trend</span></a></li>
                  <li><a href="#performance" aria-controls="performance" role="tab" data-toggle="tab"><i class="mAd_icons tab_performance"></i><span>Performance</span></a></li>
                  <li><a href="#influences" aria-controls="influences" role="tab" data-toggle="tab"><i class="mAd_icons tab_influences"></i><span>Influences</span></a></li>
                  <li><a href="#predictions" aria-controls="predictions" role="tab" data-toggle="tab"><i class="mAd_icons tab_predictions"></i><span>Predictions</span></a></li>
                </ul>

                <!-- Tab panes -->
                <div class="tab-content">
                  <div role="tabpanel" class="tab-pane active" id="overview">
					<div class="content_scroll">
                    <h4 class="text-primary">Executive Summary</h4>
                    <div class="row">
                      <div class="col-md-4">
                        <div class="panel">
                          <div class="panel-heading summary_heading">
                            <div class="btn-toolbar pull-right">
                              <div class="btn-group btn-space">
                                <button type="button" class="btn btn-default" data-target="#detail_view" data-toggle="modal"><i class="fa fa-search-plus"></i></button>
                              </div>
                            </div>
                            <span class="title">Phenomenal growth during Jan-Dec - 2014</span> </div>
                          <div class="panel-body">
                            <div class="grp_height"> <img src="../assets/images/grp1.jpg" alt="grp 1" class="img-responsive"> </div>
                            <div class="grp_legends grp_legends_green">
                              <div class="grp_legend_label">
                                <h3> 32% <small>Strong Growth</small> </h3>
                              </div>
                              <div class="grp_legend_label">
                                <h3> $128K <small>Total Sales</small> </h3>
                              </div>
                              <div class="grp_more"> <a href="#"><span class="fa fa-ellipsis-h fa-2x"></span></a> </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="panel">
                          <div class="panel-heading summary_heading">
                            <div class="btn-toolbar pull-right">
                              <div class="btn-group btn-space">
                                <button type="button" class="btn btn-default"><i class="fa fa-search-plus"></i></button>
                              </div>
                            </div>
                            <span class="title">Moderate Decline - Mar to June 2014</span> </div>
                          <div class="panel-body">
                            <div class="grp_height"> <img src="../assets/images/grp2.jpg" alt="grp 2" class="img-responsive"> </div>
                            <div class="grp_legends grp_legends_red">
                              <div class="grp_legend_label">
                                <h3> 9% <small>Decline</small> </h3>
                              </div>
                              <div class="grp_legend_label">
                                <h3> $170k <small>March to June </small> </h3>
                              </div>
                              <div class="grp_more"> <a href="#"><span class="fa fa-ellipsis-h fa-2x"></span></a> </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="panel">
                          <div class="panel-heading summary_heading">
                            <div class="btn-toolbar pull-right">
                              <div class="btn-group btn-space">
                                <button type="button" class="btn btn-default"><i class="fa fa-search-plus"></i></button>
                              </div>
                            </div>
                            <span class="title">Variance in sales</span> </div>
                          <div class="panel-body">
                            <div class="grp_height"> <img src="../assets/images/grp3.jpg" alt="grp 3" class="img-responsive"> </div>
                            <div class="grp_legends grp_legends_primary">
                              <div class="grp_legend_label">
                                <h3> 6% <small>Average Sale</small> </h3>
                              </div>
                              <div class="grp_more"> <a href="#"><span class="fa fa-ellipsis-h fa-2x"></span></a> </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="panel">
                      <div class="panel-heading summary_heading">
                        <div class="btn-toolbar pull-right">
                          <div class="btn-group btn-space">
                            <button type="button" class="btn btn-default"><i class="fa fa-search-plus"></i></button>
                          </div>
                        </div>
                        <span class="title">Opportunities</span> </div>
                      <div class="panel-body">
                        <div class="row">
                          <div class="col-md-2">
                            <div class="mAd_icons oppr_icon"> </div>
                          </div>
                          <div class="col-md-10">
                            <p class="lead">mAdvisor has observed opportunities for improving the sales figures by engaging with other key factor and metrics.</p>
                            <ul>
                              <li> Focusing more on cities, Miami, Seattle, and Boston would enhance overall sales, as they show high potential for growth and hold significant portion of current sales.</li>
                              <li>A one percentage increase in marketing cost for the segment, where Deal Type is Gourmet, Discount Range is 21 to 30 percent, and Marketing Channel is Google Ads, will correspond to 0.7% increase in sales.</li>
                              <li>The marginal effect of shipping cost on sales is very significant on Price Range, 101 to 500, as sales move by almost 46 units for every unit decrease in marketing cost.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
				  </div>
                  <div role="tabpanel" class="tab-pane" id="trend">
                    <div class="content_scroll">
					<h3>Trend</h3>
					<div class="panel">
                          <div class="panel-heading summary_heading">
                            <div class="btn-toolbar pull-right">
                              <div class="btn-group btn-space">
                                <button type="button" class="btn btn-default"><i class="fa fa-search-plus"></i></button>
                              </div>
                            </div>
                            <span class="title">Variance in sales</span> </div>
                          <div class="panel-body">
                            <div class="grp_height"> <img src="../assets/images/graph_1.png" alt="grp 3" class="img-responsive"> </div>
                            <div class="grp_legends grp_legends_primary">
                              <div class="grp_legend_label">
                                <h3> 6% <small>Average Sale</small> </h3>
                              </div>
                              <div class="grp_more"> <a href="#"><span class="fa fa-ellipsis-h fa-2x"></span></a> </div>
                            </div>
                          </div>
                        </div>
					</div>
                  </div>
                  <div role="tabpanel" class="tab-pane" id="performance">
                    <div class="sb_navigation">
                      <div class="row">
                        <div class="col-xs-11">
                          <div class="scroller scroller-left"><i class="glyphicon glyphicon-chevron-left"></i></div>
                          <div class="scroller scroller-right"><i class="glyphicon glyphicon-chevron-right"></i></div>
                          <div class="wrapper">
                            <ul class="nav nav-tabs list" id="myTab">
                              <li><a href="#" class="active" title="Average Number of cart 1"><i class="mAd_icons ic_perf"></i><span>Average Number of cart 1</span></a></li>
                              <li><a href="#" title="Average Number of cart 2"><i class="mAd_icons ic_perf"></i><span>Average Number of cart 2</span></a></li>
                              <li><a href="#" title="Average Number of cart 3"><i class="mAd_icons ic_perf"></i><span>Average Number of cart 3</span></a></li>
                              <li><a href="#" title="Average Number of cart 4"><i class="mAd_icons ic_perf"></i><span>Average Number of cart 4</span></a></li>
                              <li><a href="#" title="Average Number of cart 5"><i class="mAd_icons ic_perf"></i><span>Average Number of cart 5</span></a></li>
                              <li><a href="#" title="Average Number of cart 6"><i class="mAd_icons ic_perf"></i><span>Average Number of cart 6</span></a></li>
                              <li><a href="#" title="Average Number of cart 7"><i class="mAd_icons ic_perf"></i><span>Average Number of cart 7</span></a></li>
                              <li><a href="#" title="Average Number of cart 8"><i class="mAd_icons ic_perf"></i><span>Average Number of cart 8</span></a></li>
                              <li><a href="#" title="Average Number of cart 9"><i class="mAd_icons ic_perf"></i><span>Average Number of cart 9</span></a></li>
                              <li><a href="#" title="Average Number of cart 10"><i class="mAd_icons ic_perf"></i><span>Average Number of cart 10</span></a></li>
                              <li><a href="#" title="Average Number of cart 11"><i class="mAd_icons ic_perf"></i><span>Average Number of cart 11</span></a></li>
                              <li><a href="#" title="Average Number of cart 12"><i class="mAd_icons ic_perf"></i><span>Average Number of cart 12</span></a></li>
                              <li><a href="#" title="Average Number of cart 13"><i class="mAd_icons ic_perf"></i><span>Average Number of cart 13</span></a></li>
                            </ul>
                          </div>
                        </div>
                        <div class="col-xs-1">
                          <div class="input-group">
                            <button id='search-button' class='btn btn-default '><span class='glyphicon glyphicon-search'></span></button>
                          </div>
                          <!-- Search form <a href="javascript:;" class="input-group-addon"><i class="fa fa-search fa-2x"></i></a>-->
                          <div id='search-form' class="form-group">
                            <div class="input-group"> <span id='search-icon' class="input-group-addon"><span class='glyphicon glyphicon-search'></span></span>
                              <input type="text" class="form-control" placeholder="Search">
                            </div>
                          </div>
                          <!-- /.Search form -->

                        </div>
                      </div>
                    </div>
                    <div class="content_scroll container-fluid">
                      <div class="row row-offcanvas row-offcanvas-left">

                        <!--/span-->
                        <div class="col-xs-12 col-sm-9 content"> <img src='images/graph_1.png' class="img-responsive text-center">
                          <p> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passage.. </p>
                        </div>
                        <!--/span-->

                        <div class="col-xs-6 col-sm-3 sidebar-offcanvas" id="sidebar" role="navigation">
                          <div class="side_panel"> <a href="javscript:;" data-toggle="offcanvas" class="sdbar_switch"><i class="mAd_icons sw_on"></i></a>
                            <div class="panel panel-primary">
                              <div class="panel-heading"> <span class="title"><i class="mAd_icons ic_perf active"></i> Measure 1 </span> </div>
                              <div class="panel-body">
                                <div class="list-group"> <a href="#" class="list-group-item active">Miami's sales performance over time</a> <a href="#" class="list-group-item">City-Sales Performance Decision Matrix</a> <a href="#" class="list-group-item">Link</a> <a href="#" class="list-group-item">Link</a> <a href="#" class="list-group-item">Link</a> <a href="#" class="list-group-item">Link</a> <a href="#" class="list-group-item">Link</a> <a href="#" class="list-group-item">Link</a> <a href="#" class="list-group-item">Link</a> <a href="#" class="list-group-item">Link</a> </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="clearfix"></div>
                      </div>
                      <!--/row-->

                    </div>
                    <!-- /.container -->
                  </div>
                  <div role="tabpanel" class="tab-pane" id="influences">
				  <h1>Influences</h1>
				  <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passage..</p></div>
                  <div role="tabpanel" class="tab-pane" id="predictions">
				  <h1>Predictions</h1>
				  <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passage..</p></div>
                  <a class="tabs-control left grp_legends_green back" href="#" > <span class="fa fa-chevron-left"></span> </a> <a class="tabs-control right grp_legends_green continue" href="#" > <span class="fa fa-chevron-right"></span> </a> </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
}
