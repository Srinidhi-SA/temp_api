import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {DataPreview} from "../data/DataPreview";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {connect} from "react-redux";
import {getDataSetPreview,storeSignalMeta} from "../../actions/dataActions";
import {clearDataPreview,updateRoboUploadTab,updateRoboAnalysisData} from "../../actions/appActions";
import {RoboDUTabsContent} from "./RoboDUTabsContent";
import {RoboDUHistorialData} from "./RoboDUHistorialData";
import {RoboDUExternalData} from "./RoboDUExternalData";


var roboData = {
		"data": {
			"listOfNodes": [{
				"listOfNodes": [],
				"listOfCards": [{
					"name": "Distribution of Opportunity Result",
					"cardType": "normal",
					"cardData": [{
						"dataType": "html",
						"data": "<p class=\"lead txt-justify\"> The Opportunity Result variable has only two values, i.e. Loss and Won. Loss is the <b>largest</b> with 3,668 observations, whereas Won is the <b>smallest</b> with just 1,332 observations. </p>"
					}, {
						"dataType": "c3Chart",
						"data": {
							"chart_c3": {
								"bar": {
									"width": {
										"ratio": 0.5
									}
								},
								"point": null,
								"color": {
									"pattern": ["#0fc4b5", "#005662", "#148071", "#6cba86", "#bcf3a2"]
								},
								"tooltip": {
									"show": true
								},
								"padding": {
									"top": 40
								},
								"grid": {
									"y": {
										"show": true
									},
									"x": {
										"show": true
									}
								},
								"subchart": null,
								"axis": {
									"y": {
										"tick": {
											"outer": false,
											"format": ".2s"
										},
										"label": {
											"text": "",
											"position": "outer-middle"
										}
									},
									"x": {
										"height": 64.14213562373095,
										"tick": {
											"rotate": -45,
											"multiline": false,
											"fit": false
										},
										"type": "category",
										"label": {
											"text": "",
											"position": "outer-center"
										}
									}
								},
								"data": {
									"x": "key",
									"axes": {
										"value": "y"
									},
									"type": "bar",
									"columns": [
										["value", 3668, 1332],
										["key", "Loss", "Won"]
									]
								},
								"legend": {
									"show": false
								},
								"size": {
									"height": 340
								}
							},
							"yformat": ".2s"
						}
					}, {
						"dataType": "html",
						"data": "<p class = \"txt-justify\"> The segment Loss accounts for 73.36% of the overall observations. </p>"
					}, {
						"dataType": "html",
						"data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>73.36%</span><br /><small> Loss is the largest with 3,668 observations</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>26.64%</span><br /><small> Won is the smallest with 1,332 observations</small></h2></div>"
					}],
					"slug": "distribution-of-opportunity-result-kby4i0qfu9",
					"cardWidth": 100
				}],
				"name": "Overview",
				"slug": "overview-9u5mwq95ey"
			}, {
				"listOfNodes": [{
					"listOfNodes": [],
					"listOfCards": [{
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Relationship between Opportunity Result  and Elapsed Day</h3>"
						}, {
							"dataType": "table",
							"data": {
								"tableType": "heatMap",
								"tableData": [
									["Elapsed Day", "Won", "Loss"],
									["0 to 25.2", 83.74, 16.26],
									["25.2 to 50.4", 34.62, 65.38],
									["50.4 to 75.6", 8.75, 91.25],
									["75.6 to 100.8", 13.9, 86.1],
									["100.8 to 126", 100.0, 0.0]
								]
							}
						}, {
							"dataType": "html",
							"data": "<h4>Overview</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Elapsed Day is one of <b>the most significant influencers</b> of Opportunity Result and displays significant variation in distribution of Opportunity Result categories. <b>Segment 75.6 to 100.8 </b> is the largest Elapsed Day, accounting for almost<b> 50.5% of the total </b>observations. <b>Segment 100.8 to 126</b> is the smallest with <b>just 2.04%</b> of the total observations. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Won</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> The <b>percentage of Won</b> is the <b> lowest for the segment 50.4 to 75.6</b> (8.7%). The segment <b> 100.8 to 126</b> has the <b>highest rate of Won</b> (100.0%), which is 10.4 times higher than segment 50.4 to 75.6 and 275.4% higher than the overall Won rate. Interestingly, the <b>segment 75.6 to 100.8</b>, which accounts for <b>50.5% of the total </b>observations, has contributed to <b>26.4% of total Won</b>. On the other hand, the segment <b>0 to 25.2</b> accounts for <b>14.9% of the total</b> observations, but it has contributed to <b>46.8% of total Won</b>. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Loss</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> When it comes to <b>Loss, segment 100.8 to 126</b> seems to be the <b>least dominant segment</b> since 0.0% of its total observations are into Loss category. But,<b> segment 50.4 to 75.6</b> has the <b>highest rate of Loss</b> (91.3%). Interestingly, <b>segment 0 to 25.2 and segment 100.8 to 126</b>, which cumulatively account for <b> 16.9% of the total </b>observations, have contributed to <b> 3.3% of total Loss</b>. On the other hand, the segment <b>75.6 to 100.8</b> accounts for <b>50.5% of the total</b> observations, but it has contributed to <b>59.3% of total Loss</b>. </p>"
						}],
						"name": "Elapsed Day: Relationship with Opportunity Result",
						"slug": "elapsed-day-relationship-with-opportunity-result-5kmyn0scib"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Won) across Elapsed Day</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 95.96194077712559,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 83.73655913978494, 34.62414578587699, 8.746846089150546, 13.895486935866984, 100.0],
											["total", 623.0, 152.0, 104.0, 351.0, 102.0],
											["key", "0 to 25.2", "25.2 to 50.4", "50.4 to 75.6", "75.6 to 100.8", "100.8 to 126"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Elapsed Day(segment 0 to 25.2) accounts for 46.8% of the total Won observations. The segment 100.8 to 126 contributes to just 7.66% of the total Won. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Won from 0 to 25.2</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Size By Revenue, Revenue and Deal Size Category are some of the most important factors that describe the concentration of Won from segment 0 to 25.2 Value category. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Size By Revenue</b>: Among the Size By Revenues, Less than 1M has got the major chunk of Won from segment 0 to 25.2, accounting for 56.3%. The percentage of Won for Less than 1M is 82.4%. </li> </li> <li> <b>Revenue</b>: Among the Revenues, 0 has got the major chunk of Won from segment 0 to 25.2, accounting for 84.6%. The percentage of Won for 0 is 82.0%. </li> </li> <li> <b>Deal Size Category</b>: Among the Deal Size Categories, the top 2 Deal Size Categories, 10k to 25k(31.6%) and Less than 10k(26.0%), contribute to 57.6% of the total Won observations from segment 0 to 25.2. The percentage of Won for 10k to 25k and Less than 10k are 90.0% and 93.1% respectively. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>46.8%</span><br /><small>Overall Won comes from 0 to 25.2</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>100.0%</span><br /><small>100.8 to 126 has the highest rate of Won</small></h2></div>"
						}],
						"name": "Elapsed Day : Distribution of Loss",
						"slug": "elapsed-day-distribution-of-loss-axr7h3dpcm"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Loss) across Elapsed Day</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 95.96194077712559,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 16.263440860215052, 65.37585421412301, 91.25315391084945, 86.10451306413302, 0.0],
											["total", 121.0, 287.0, 1085.0, 2175.0, 0.0],
											["key", "0 to 25.2", "25.2 to 50.4", "50.4 to 75.6", "75.6 to 100.8", "100.8 to 126"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Elapsed Day(segment 75.6 to 100.8) account for 59.3% of the total Loss observations. The segment 100.8 to 126 contributes to just 0.0% of the total Loss. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Loss from 75.6 to 100.8</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Revenue, Deal Size Category and Size By Employees are some of the most important factors that describe the concentration of Loss from segment 75.6 to 100.8 Value category. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Revenue</b>: Among the Revenues, 0 has got the major chunk of Loss from segment 75.6 to 100.8, accounting for 95.3%. The percentage of Loss for 0 is 88.6%. </li> </li> <li> <b>Deal Size Category</b>: 50k to 100k plays a key role in explaining the high concentration of Loss from segment 75.6 to 100.8. It accounts for 28.7% of total Loss from segment 75.6 to 100.8. The percentage of Loss for 50k to 100k is 92.9%. </li> </li> <li> <b>Size By Employees</b>: Among the Size By Employees, Less than 1k has got the major chunk of Loss from segment 75.6 to 100.8, accounting for 43.5%. The percentage of Loss for Less than 1k is 84.8%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>59.3%</span><br /><small>Overall Loss comes from 75.6 to 100.8</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>91.3%</span><br /><small>50.4 to 75.6 has the highest rate of Loss</small></h2></div>"
						}],
						"name": "Elapsed Day : Distribution of Won",
						"slug": "elapsed-day-distribution-of-won-hp54bqqv18"
					}],
					"name": "Elapsed Day",
					"slug": "elapsed-day-ok9nr10opr"
				}, {
					"listOfNodes": [],
					"listOfCards": [{
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Relationship between Opportunity Result  and Qualified Days</h3>"
						}, {
							"dataType": "table",
							"data": {
								"tableType": "heatMap",
								"tableData": [
									["Qualified Days", "Won", "Loss"],
									["0 to 23", 51.94, 48.06],
									["23 to 46", 8.04, 91.96],
									["46 to 69", 4.81, 95.19],
									["69 to 92", 2.08, 97.92],
									["92 to 115", 4.84, 95.16]
								]
							}
						}, {
							"dataType": "html",
							"data": "<h4>Overview</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Qualified Days is one of <b>the most significant influencers</b> of Opportunity Result and displays significant variation in distribution of Opportunity Result categories. <b>Segment 0 to 23 and segment 23 to 46 </b> are the two largest Qualified Days, accounting for <b> 82.4% </b> of the total observations. <b>Segment 92 to 115</b> is the smallest with <b>just 1.24%</b> of the total observations. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Won</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> The <b>percentage of Won</b> is the <b> lowest for the segment 69 to 92</b> (2.1%). The segment <b> 0 to 23</b> has the <b>highest rate of Won</b> (51.9%), which is 23.9 times higher than segment 69 to 92 and 95.0% higher than the overall Won rate. Interestingly, the <b>segment 23 to 46</b>, which accounts for <b>38.5% of the total </b>observations, has contributed to <b>11.6% of total Won</b>. On the other hand, the segment <b>0 to 23</b> accounts for <b>43.9% of the total</b> observations, but it has contributed to <b>85.6% of total Won</b>. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Loss</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> When it comes to <b>Loss, segment 0 to 23</b> seems to be the <b>least dominant segment</b> since 48.1% of its total observations are into Loss category. But,<b> segment 69 to 92</b> has the <b>highest rate of Loss</b> (97.9%). Interestingly, <b>segment 0 to 23</b>, which accounts for <b>43.9% of the total </b>observations, has contributed to <b>28.8% of total Loss</b>. On the other hand, the segment <b>23 to 46</b> accounts for <b>38.5% of the total</b> observations, but it has contributed to <b>48.3% of total Loss</b>. </p>"
						}],
						"name": "Qualified Days: Relationship with Opportunity Result",
						"slug": "qualified-days-relationship-with-opportunity-result-0d574rc8x2"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Won) across Qualified Days</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 81.81980515339464,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 51.93621867881549, 8.043591074208614, 4.8076923076923075, 2.0833333333333335, 4.838709677419355],
											["total", 1140.0, 155.0, 30.0, 4.0, 3.0],
											["key", "0 to 23", "23 to 46", "46 to 69", "69 to 92", "92 to 115"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Qualified Days(segment 0 to 23) accounts for 85.6% of the total Won observations. The segment 92 to 115 contributes to just 0.23% of the total Won. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Won from 0 to 23</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> There are some key factors(Size By Revenue, Deal Size Category and Market Route) that explain why the concentration of Won from segment 0 to 23 is very high. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Size By Revenue</b>: Among the Size By Revenues, Less than 1M has got the major chunk of Won from segment 0 to 23, accounting for 53.2%. The percentage of Won for Less than 1M is 54.8%. </li> </li> <li> <b>Deal Size Category</b>: Some of the Deal Size Categories(10k to 25k(27.4%) and Less than 10k(24.1%)) account for a significant portion of Won observations from segment 0 to 23. They cumulatively account for about 51.5% of the total Won from segment 0 to 23. The percentage of Won for 10k to 25k and Less than 10k are 62.9% and 65.8% respectively. </li> </li> <li> <b>Market Route</b>: Among the Market Routes, Reseller has got the major chunk of Won from segment 0 to 23, accounting for 65.3%. The percentage of Won for Reseller is 68.7%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>85.6%</span><br /><small>Overall Won comes from 0 to 23</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>51.9%</span><br /><small>0 to 23 has the highest rate of Won</small></h2></div>"
						}],
						"name": "Qualified Days : Distribution of Loss",
						"slug": "qualified-days-distribution-of-loss-0oi3s0vt5m"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Loss) across Qualified Days</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 81.81980515339464,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 48.06378132118451, 91.95640892579138, 95.1923076923077, 97.91666666666667, 95.16129032258064],
											["total", 1055.0, 1772.0, 594.0, 188.0, 59.0],
											["key", "0 to 23", "23 to 46", "46 to 69", "69 to 92", "92 to 115"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Qualified Days(segment 23 to 46) account for 48.3% of the total Loss observations. The segment 92 to 115 contributes to just 1.6% of the total Loss. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Loss from 23 to 46</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> There are some key factors(Subgroup, Region and Size By Employees) that explain why the concentration of Loss from segment 23 to 46 is very high. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Subgroup</b>: Some of the Subgroup(Motorcycle Parts(19.92%) and Exterior Accessories(18.85%)) account of a significant portion of Loss observations from segment 23 to 46. They cumulatively account for about 38.8% of the total Loss from segment 23 to 46. The percentage of Loss for Motorcycle Parts and Exterior Accessories are 92.4% and 89.3% respectively. </li> </li> <li> <b>Region</b>: Among the Regions, Midwest has got the major chunk of Loss from segment 23 to 46, accounting for 49.1%. The percentage of Loss for Midwest is 89.9%. </li> </li> <li> <b>Size By Employees</b>: Among the Size By Employees, Less than 1k has got the major chunk of Loss from segment 23 to 46, accounting for 43.8%. The percentage of Loss for Less than 1k is 92.4%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>48.3%</span><br /><small>Overall Loss comes from 23 to 46</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>97.9%</span><br /><small>69 to 92 has the highest rate of Loss</small></h2></div>"
						}],
						"name": "Qualified Days : Distribution of Won",
						"slug": "qualified-days-distribution-of-won-14aprjhit2"
					}],
					"name": "Qualified Days",
					"slug": "qualified-days-cf8m30lo6p"
				}, {
					"listOfNodes": [],
					"listOfCards": [{
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Relationship between Opportunity Result  and Closing Days</h3>"
						}, {
							"dataType": "table",
							"data": {
								"tableType": "heatMap",
								"tableData": [
									["Closing Days", "Won", "Loss"],
									["0 to 23", 52.27, 47.73],
									["23 to 46", 8.71, 91.29],
									["46 to 69", 4.75, 95.25],
									["69 to 92", 3.52, 96.48],
									["92 to 115", 8.82, 91.18]
								]
							}
						}, {
							"dataType": "html",
							"data": "<h4>Overview</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Closing Days is one of <b>the most significant influencers</b> of Opportunity Result and displays significant variation in distribution of Opportunity Result categories. <b>Segment 0 to 23 and segment 23 to 46 </b> are the two largest Closing Days, accounting for <b> 82.0% </b> of the total observations. <b>Segment 92 to 115</b> is the smallest with <b>just 1.36%</b> of the total observations. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Won</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> The <b>percentage of Won</b> is the <b> lowest for the segment 69 to 92</b> (3.5%). The segment <b> 0 to 23</b> has the <b>highest rate of Won</b> (52.3%), which is 13.9 times higher than segment 69 to 92 and 96.2% higher than the overall Won rate. Interestingly, the <b>segment 23 to 46</b>, which accounts for <b>39.3% of the total </b>observations, has contributed to <b>12.8% of total Won</b>. On the other hand, the segment <b>0 to 23</b> accounts for <b>42.8% of the total</b> observations, but it has contributed to <b>83.9% of total Won</b>. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Loss</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> When it comes to <b>Loss, segment 0 to 23</b> seems to be the <b>least dominant segment</b> since 47.7% of its total observations are into Loss category. But,<b> segment 69 to 92</b> has the <b>highest rate of Loss</b> (96.5%). Interestingly, <b>segment 0 to 23</b>, which accounts for <b>42.8% of the total </b>observations, has contributed to <b>27.8% of total Loss</b>. On the other hand, the segment <b>23 to 46</b> accounts for <b>39.3% of the total</b> observations, but it has contributed to <b>48.9% of total Loss</b>. </p>"
						}],
						"name": "Closing Days: Relationship with Opportunity Result",
						"slug": "closing-days-relationship-with-opportunity-result-ccf9u86ncm"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Won) across Closing Days</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 81.81980515339464,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 52.2674146797569, 8.711156393275598, 4.754358161648177, 3.5175879396984926, 8.823529411764707],
											["total", 1118.0, 171.0, 30.0, 7.0, 6.0],
											["key", "0 to 23", "23 to 46", "46 to 69", "69 to 92", "92 to 115"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Closing Days(segment 0 to 23) accounts for 83.9% of the total Won observations. The segment 92 to 115 contributes to just 0.45% of the total Won. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Won from 0 to 23</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> High concentration of Won from segment 0 to 23 is characterized by the influence of key dimensions, such as Competitor Type, Size By Revenue and Deal Size Category. Certain specific segments from those factors are more likely to explain segment 0 to 23's significant rate of Won. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Competitor Type</b>: Unknown plays a key role in explaining the high concentration of Won from segment 0 to 23. It accounts for 76.8% of total Won from segment 0 to 23. The percentage of Won for Unknown is 54.3%. </li> </li> <li> <b>Size By Revenue</b>: Less than 1M plays a key role in explaining the high concentration of Won from segment 0 to 23. It accounts for 53.0% of total Won from segment 0 to 23. The percentage of Won for Less than 1M is 54.7%. </li> </li> <li> <b>Deal Size Category</b>: Among the Deal Size Categories, the top 2 Deal Size Categories, 10k to 25k(27.4%) and Less than 10k(24.4%), contribute to 51.8% of the total Won observations from segment 0 to 23. The percentage of Won for 10k to 25k and Less than 10k are 63.2% and 66.1% respectively. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>83.9%</span><br /><small>Overall Won comes from 0 to 23</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>52.3%</span><br /><small>0 to 23 has the highest rate of Won</small></h2></div>"
						}],
						"name": "Closing Days : Distribution of Loss",
						"slug": "closing-days-distribution-of-loss-rb5t79ujx1"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Loss) across Closing Days</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 81.81980515339464,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 47.7325853202431, 91.2888436067244, 95.24564183835182, 96.48241206030151, 91.17647058823529],
											["total", 1021.0, 1792.0, 601.0, 192.0, 62.0],
											["key", "0 to 23", "23 to 46", "46 to 69", "69 to 92", "92 to 115"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Closing Days(segment 23 to 46) account for 48.9% of the total Loss observations. The segment 92 to 115 contributes to just 1.7% of the total Loss. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Loss from 23 to 46</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> High concentration of Loss from segment 23 to 46 is characterized by the influence of key dimensions, such as Size By Employees, Revenue and Group. Certain specific segments from those factors are more likely to explain segment 23 to 46's significant rate of Loss. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Size By Employees</b>: Among the Size By Employees, Less than 1k has got the major chunk of Loss from segment 23 to 46, accounting for 43.6%. The percentage of Loss for Less than 1k is 91.8%. </li> </li> <li> <b>Revenue</b>: 0 plays a key role in explaining the high concentration of Loss from segment 23 to 46. It accounts for 94.5% of total Loss from segment 23 to 46. The percentage of Loss for 0 is 94.0%. </li> </li> <li> <b>Group</b>: Among the Groups, the top 2 Groups, Car Accessories(60.71%) and Performance & Non-auto(38.11%), contribute to 98.8% of the total Loss observations from segment 23 to 46. The percentage of Loss for Car Accessories and Performance & Non-auto are 90.8% and 91.8% respectively. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>48.9%</span><br /><small>Overall Loss comes from 23 to 46</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>96.5%</span><br /><small>69 to 92 has the highest rate of Loss</small></h2></div>"
						}],
						"name": "Closing Days : Distribution of Won",
						"slug": "closing-days-distribution-of-won-z5ffx7354g"
					}],
					"name": "Closing Days",
					"slug": "closing-days-6dyhxvn72m"
				}, {
					"listOfNodes": [],
					"listOfCards": [{
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Relationship between Opportunity Result  and Revenue</h3>"
						}, {
							"dataType": "table",
							"data": {
								"tableType": "heatMap",
								"tableData": [
									["Revenue", "Won", "Loss"],
									["0", 23.48, 76.52],
									["1 to 50k", 86.02, 13.98],
									["50k to 400k", 78.57, 21.43],
									["400k to 1.5M", 56.1, 43.9],
									["More than 1.5M", 34.71, 65.29]
								]
							}
						}, {
							"dataType": "html",
							"data": "<h4>Overview</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Revenue is one of <b>the most significant influencers</b> of Opportunity Result and displays significant variation in distribution of Opportunity Result categories. <b>Segment 0 </b> is the largest Revenue, accounting for almost<b> 91.1% of the total </b>observations. <b>Segment 400k to 1.5M</b> is the smallest with <b>just 1.64%</b> of the total observations. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Won</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> The <b>percentage of Won</b> is the <b> lowest for the segment 0</b> (23.5%). The segment <b> 1 to 50k</b> has the <b>highest rate of Won</b> (86.0%), which is 266.4% higher than segment 0 and 222.9% higher than the overall Won rate. Interestingly, the <b>segment 0</b>, which accounts for <b>91.1% of the total </b>observations, has contributed to <b>80.3% of total Won</b>. On the other hand, the segment <b>1 to 50k</b> accounts for <b>1.9% of the total</b> observations, but it has contributed to <b>6.0% of total Won</b>. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Loss</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> When it comes to <b>Loss, segment 1 to 50k</b> seems to be the <b>least dominant segment</b> since 14.0% of its total observations are into Loss category. But,<b> segment 0</b> has the <b>highest rate of Loss</b> (76.5%). Interestingly, <b>segment 1 to 50k and segment 50k to 400k</b>, which cumulatively account for <b> 3.8% of the total </b>observations, have contributed to <b> 0.9% of total Loss</b>. On the other hand, the segment <b>0</b> accounts for <b>91.1% of the total</b> observations, but it has contributed to <b>95.1% of total Loss</b>. </p>"
						}],
						"name": "Revenue: Relationship with Opportunity Result",
						"slug": "revenue-relationship-with-opportunity-result-0lgfwjzmo6"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Won) across Revenue</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 99.49747468305833,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 23.48035988588984, 86.02150537634408, 78.57142857142857, 56.09756097560975, 34.705882352941174],
											["total", 1070.0, 80.0, 77.0, 46.0, 59.0],
											["key", "0", "1 to 50k", "50k to 400k", "400k to 1.5M", "More than 1.5M"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Revenue(segment 0) accounts for 80.3% of the total Won observations. The segment 400k to 1.5M contributes to just 3.45% of the total Won. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Won from 0</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Subgroup, Size By Employees and Deal Size Category are some of the most important factors that describe the concentration of Won from segment 0 Value category. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Subgroup</b>: Some of the Subgroups(including Exterior Accessories(24.1%) and Garage & Car Care(20.5%)) account for a significant portion of Won observations from segment 0. They cumulatively account for about 92.7% of the total Won from segment 0. The percentage of Won for Exterior Accessories and Garage & Car Care are 28.7% and 36.3% respectively. </li> </li> <li> <b>Size By Employees</b>: Less than 1k plays a key role in explaining the high concentration of Won from segment 0. It accounts for 53.1% of total Won from segment 0. The percentage of Won for Less than 1k is 26.4%. </li> </li> <li> <b>Deal Size Category</b>: The top 5 Deal Size Categories, including 10k to 25k(26.5%) and Less than 10k(23.9%), account for 92.3% of the total Won observations from segment 0. The percentage of Won for 10k to 25k and Less than 10k are 33.6% and 39.8% respectively. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>80.3%</span><br /><small>Overall Won comes from 0</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>86.0%</span><br /><small>1 to 50k has the highest rate of Won</small></h2></div>"
						}],
						"name": "Revenue : Distribution of Loss",
						"slug": "revenue-distribution-of-loss-3b2k1w1ieg"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Loss) across Revenue</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 99.49747468305833,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 76.51964011411016, 13.978494623655914, 21.428571428571427, 43.90243902439025, 65.29411764705883],
											["total", 3487.0, 13.0, 21.0, 36.0, 111.0],
											["key", "0", "1 to 50k", "50k to 400k", "400k to 1.5M", "More than 1.5M"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Revenue(segment 0) account for 95.1% of the total Loss observations. The segment 1 to 50k contributes to just 0.3% of the total Loss. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Loss from 0</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Market Route, Subgroup and Deal Size Category are some of the most important factors that describe the concentration of Loss from segment 0 Value category. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Market Route</b>: Among the Market Routes, the top 2 Market Routes, Fields Sales(51.05%) and Reseller(39.46%), contribute to 90.5% of the total Loss observations from segment 0. The percentage of Loss for Fields Sales and Reseller are 85.4% and 66.8% respectively. </li> </li> <li> <b>Subgroup</b>: Some of the Subgroup(Motorcycle Parts(20.48%) and Exterior Accessories(18.41%)) account of a significant portion of Loss observations from segment 0. They cumulatively account for about 38.9% of the total Loss from segment 0. The percentage of Loss for Motorcycle Parts and Exterior Accessories are 81.3% and 71.3% respectively. </li> </li> <li> <b>Deal Size Category</b>: Among the Deal Size Categories, the top 2 Deal Size Categories, 50k to 100k(27.13%) and 100k to 250k(22.37%), contribute to 49.5% of the total Loss observations from segment 0. The percentage of Loss for 50k to 100k and 100k to 250k are 87.3% and 86.4% respectively. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>95.1%</span><br /><small>Overall Loss comes from 0</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>76.5%</span><br /><small>0 has the highest rate of Loss</small></h2></div>"
						}],
						"name": "Revenue : Distribution of Won",
						"slug": "revenue-distribution-of-won-5b5twc1fca"
					}],
					"name": "Revenue",
					"slug": "revenue-rtkdoewkcy"
				}, {
					"listOfNodes": [],
					"listOfCards": [{
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Relationship between Opportunity Result  and Deal Size Category</h3>"
						}, {
							"dataType": "table",
							"data": {
								"tableType": "heatMap",
								"tableData": [
									["Deal Size Category", "Won", "Loss"],
									["Less than 10k", 42.96, 57.04],
									["10k to 25k", 36.89, 63.11],
									["25k to 50k", 29.1, 70.9],
									["50k to 100k", 15.76, 84.24],
									["100k to 250k", 16.37, 83.63],
									["250k to 500k", 23.28, 76.72],
									["More than 500k", 39.32, 60.68]
								]
							}
						}, {
							"dataType": "html",
							"data": "<h4>Overview</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Deal Size Category is one of <b>the most significant influencers</b> of Opportunity Result and displays significant variation in distribution of Opportunity Result categories. The top 5 Deal Size Categories including segment 50k to 100k and segment 100k to 250k account for <b> 91.6% </b>of the total observations. <b>Segment More than 500k</b> is the smallest with <b>just 2.34%</b> of the total observations. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Won</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> The <b>percentage of Won</b> is the <b> lowest for the segment 50k to 100k</b> (15.8%). The segment <b> Less than 10k</b> has the <b>highest rate of Won</b> (43.0%), which is 172.5% higher than segment 50k to 100k and 61.3% higher than the overall Won rate. Interestingly, the <b>segment 50k to 100k and segment 100k to 250k</b>, which cumulatively account for <b> 43.7% of the total </b>observations, has contributed to <b> 26.4% of total Won</b>. On the other hand, the segments <b>10k to 25k and Less than 10k</b> cumulatively account for <b>32.2% of the total</b> observations, but it has contributed to <b>47.8% of total Won</b>. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Loss</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> When it comes to <b>Loss, segment Less than 10k</b> seems to be the <b>least dominant segment</b> since 57.0% of its total observations are into Loss category. But,<b> segment 50k to 100k</b> has the <b>highest rate of Loss</b> (84.2%). Interestingly, <b>segment Less than 10k and segment 10k to 25k</b>, which cumulatively account for <b> 32.2% of the total </b>observations, have contributed to <b> 26.6% of total Loss</b>. On the other hand, the segments <b>100k to 250k and 50k to 100k</b> cumulatively account for <b>43.7% of the total</b> observations, but it has contributed to <b>50.1% of total Loss</b>. </p>"
						}],
						"name": "Deal Size Category: Relationship with Opportunity Result",
						"slug": "deal-size-category-relationship-with-opportunity-result-dxxbbgvq7o"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Won) across Deal Size Category</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 99.49747468305833,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 42.95874822190612, 36.8942731277533, 29.102564102564102, 15.762273901808786, 16.374269005847953, 23.278688524590162, 39.31623931623932],
											["total", 302.0, 335.0, 227.0, 183.0, 168.0, 71.0, 46.0],
											["key", "Less than 10k", "10k to 25k", "25k to 50k", "50k to 100k", "100k to 250k", "250k to 500k", "More than 500k"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top 5 Deal Size Categories(including segment 10k to 25k and segment Less than 10k) account for 91.2% of the total Won observations. Being the largest contributor, total Won from 10k to 25k amounts to 335.0 that accounts for about 25.1% of the total Won. On the other hand, More than 500k contributes to just 3.45% of the total Won. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Won from 10k to 25k</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Competitor Type, Size By Employees and Region are some of the most important factors that describe the concentration of Won from segment 10k to 25k Value category. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Competitor Type</b>: Unknown plays a key role in explaining the high concentration of Won from segment 10k to 25k. It accounts for 78.8% of total Won from segment 10k to 25k. The percentage of Won for Unknown is 35.3%. </li> </li> <li> <b>Size By Employees</b>: Among the Size By Employees, Less than 1k has got the major chunk of Won from segment 10k to 25k, accounting for 56.4%. The percentage of Won for Less than 1k is 39.0%. </li> </li> <li> <b>Region</b>: Among the Regions, Midwest has got the major chunk of Won from segment 10k to 25k, accounting for 58.2%. The percentage of Won for Midwest is 36.8%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>25.2%</span><br /><small>Overall Won comes from 10k to 25k</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>43.0%</span><br /><small>Less than 10k has the highest rate of Won</small></h2></div>"
						}],
						"name": "Deal Size Category : Distribution of Loss",
						"slug": "deal-size-category-distribution-of-loss-hze3u51ebo"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Loss) across Deal Size Category</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 99.49747468305833,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 57.04125177809388, 63.1057268722467, 70.8974358974359, 84.23772609819122, 83.62573099415205, 76.72131147540983, 60.68376068376068],
											["total", 401.0, 573.0, 553.0, 978.0, 858.0, 234.0, 71.0],
											["key", "Less than 10k", "10k to 25k", "25k to 50k", "50k to 100k", "100k to 250k", "250k to 500k", "More than 500k"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top 2 Deal Size Categories(segment 50k to 100k and segment 100k to 250k) account for 50.1% of the total Loss observations. Being the largest contributor, total Loss from 50k to 100k amounts to 978.0 that accounts for about 26.7% of the total Loss. On the other hand, More than 500k contributes to just 1.9% of the total Loss. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Loss from 50k to 100k</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Region, Revenue and Subgroup are some of the most important factors that describe the concentration of Loss from segment 50k to 100k Value category. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Region</b>: Midwest plays a key role in explaining the high concentration of Loss from segment 50k to 100k. It accounts for 48.2% of total Loss from segment 50k to 100k. The percentage of Loss for Midwest is 83.4%. </li> </li> <li> <b>Revenue</b>: 0 plays a key role in explaining the high concentration of Loss from segment 50k to 100k. It accounts for 96.7% of total Loss from segment 50k to 100k. The percentage of Loss for 0 is 87.3%. </li> </li> <li> <b>Subgroup</b>: Among the Subgroups, Motorcycle Parts has got the major chunk of Loss from segment 50k to 100k, accounting for 27.4%. The percentage of Loss for Motorcycle Parts is 89.6%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>26.7%</span><br /><small>Overall Loss comes from 50k to 100k</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>84.2%</span><br /><small>50k to 100k has the highest rate of Loss</small></h2></div>"
						}],
						"name": "Deal Size Category : Distribution of Won",
						"slug": "deal-size-category-distribution-of-won-xxxipeb6k1"
					}],
					"name": "Deal Size Category",
					"slug": "deal-size-category-k8su4k2fhy"
				}, {
					"listOfNodes": [],
					"listOfCards": [{
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Relationship between Opportunity Result  and Market Route</h3>"
						}, {
							"dataType": "table",
							"data": {
								"tableType": "heatMap",
								"tableData": [
									["Market Route", "Won", "Loss"],
									["Fields Sales", 17.4, 82.6],
									["Other", 19.11, 80.89],
									["Reseller", 37.17, 62.83],
									["Telecoverage", 0.0, 100.0],
									["Telesales", 37.97, 62.03]
								]
							}
						}, {
							"dataType": "html",
							"data": "<h4>Overview</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Market Route is one of <b>the most significant influencers</b> of Opportunity Result and displays significant variation in distribution of Opportunity Result categories. <b>Segment Fields Sales and segment Reseller </b> are the two largest Market Routes, accounting for <b> 91.0% </b> of the total observations. <b>Segment Telecoverage</b> is the smallest with <b>just 0.16%</b> of the total observations. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Won</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> The <b>percentage of Won</b> is the <b> lowest for the segment Fields Sales</b> (17.4%). The segment <b> Telesales</b> has the <b>highest rate of Won</b> (38.0%), which is 118.3% higher than segment Fields Sales and 42.5% higher than the overall Won rate. Interestingly, the <b>segment Fields Sales</b>, which accounts for <b>46.4% of the total </b>observations, has contributed to <b>30.3% of total Won</b>. On the other hand, the segment <b>Reseller</b> accounts for <b>44.6% of the total</b> observations, but it has contributed to <b>62.2% of total Won</b>. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Loss</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> When it comes to <b>Loss, segment Telesales</b> seems to be the <b>least dominant segment</b> since 62.0% of its total observations are into Loss category. But,<b> segment Telecoverage</b> has the <b>highest rate of Loss</b> (100.0%). Interestingly, <b>segment Reseller</b>, which accounts for <b>44.6% of the total </b>observations, has contributed to <b>38.2% of total Loss</b>. On the other hand, the segment <b>Fields Sales</b> accounts for <b>46.4% of the total</b> observations, but it has contributed to <b>52.3% of total Loss</b>. </p>"
						}],
						"name": "Market Route: Relationship with Opportunity Result",
						"slug": "market-route-relationship-with-opportunity-result-z77y7q05ue"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Won) across Market Route</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 92.42640687119285,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 17.39879414298019, 19.113573407202217, 37.17488789237668, 0.0, 37.9746835443038],
											["total", 404.0, 69.0, 829.0, 0.0, 30.0],
											["key", "Fields Sales", "Other", "Reseller", "Telecoverage", "Telesales"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Market Route(segment Reseller) accounts for 62.2% of the total Won observations. The segment Telecoverage contributes to just 0.0% of the total Won. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Won from Reseller</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> There are some key factors(Region, Competitor Type and Deal Size Category) that explain why the concentration of Won from segment Reseller is very high. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Region</b>: Among the Regions, Midwest has got the major chunk of Won from segment Reseller, accounting for 63.2%. The percentage of Won for Midwest is 39.9%. </li> </li> <li> <b>Competitor Type</b>: Unknown plays a key role in explaining the high concentration of Won from segment Reseller. It accounts for 90.8% of total Won from segment Reseller. The percentage of Won for Unknown is 38.2%. </li> </li> <li> <b>Deal Size Category</b>: Some of the Deal Size Categories(including 10k to 25k(29.7%) and Less than 10k(24.4%)) account for a significant portion of Won observations from segment Reseller. They cumulatively account for about 73.5% of the total Won from segment Reseller. The percentage of Won for 10k to 25k and Less than 10k are 39.9% and 45.9% respectively. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>62.2%</span><br /><small>Overall Won comes from Reseller</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>38.0%</span><br /><small>Telesales has the highest rate of Won</small></h2></div>"
						}],
						"name": "Market Route : Distribution of Loss",
						"slug": "market-route-distribution-of-loss-04hhs6cu03"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Loss) across Market Route</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 92.42640687119285,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 82.6012058570198, 80.88642659279779, 62.82511210762332, 100.0, 62.0253164556962],
											["total", 1918.0, 292.0, 1401.0, 8.0, 49.0],
											["key", "Fields Sales", "Other", "Reseller", "Telecoverage", "Telesales"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top 2 Market Routes(segment Fields Sales and segment Reseller) account for 90.5% of the total Loss observations. Being the largest contributor, total Loss from Fields Sales amounts to 1,918.0 that accounts for about 52.3% of the total Loss. On the other hand, Telecoverage contributes to just 0.2% of the total Loss. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Loss from Fields Sales</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> There are some key factors(Group, Size By Employees and Deal Size Category) that explain why the concentration of Loss from segment Fields Sales is very high. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Group</b>: Among the Groups, the top 2 Groups, Car Accessories(61.89%) and Performance & Non-auto(36.86%), contribute to 98.8% of the total Loss observations from segment Fields Sales. The percentage of Loss for Car Accessories and Performance & Non-auto are 80.4% and 86.1% respectively. </li> </li> <li> <b>Size By Employees</b>: Among the Size By Employees, Less than 1k has got the major chunk of Loss from segment Fields Sales, accounting for 36.9%. The percentage of Loss for Less than 1k is 78.2%. </li> </li> <li> <b>Deal Size Category</b>: Among the Deal Size Categories, the top 2 Deal Size Categories, 100k to 250k(33.63%) and 50k to 100k(28.68%), contribute to 62.3% of the total Loss observations from segment Fields Sales. The percentage of Loss for 100k to 250k and 50k to 100k are 88.7% and 89.3% respectively. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>52.3%</span><br /><small>Overall Loss comes from Fields Sales</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>100.0%</span><br /><small>Telecoverage has the highest rate of Loss</small></h2></div>"
						}],
						"name": "Market Route : Distribution of Won",
						"slug": "market-route-distribution-of-won-slzmyto411"
					}],
					"name": "Market Route",
					"slug": "market-route-4hpu64ihk6"
				}, {
					"listOfNodes": [],
					"listOfCards": [{
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Relationship between Opportunity Result  and Subgroup</h3>"
						}, {
							"dataType": "table",
							"data": {
								"tableType": "heatMap",
								"tableData": [
									["Subgroup", "Won", "Loss"],
									["Batteries & Accessories", 27.83, 72.17],
									["Car Electronics", 36.59, 63.41],
									["Exterior Accessories", 32.57, 67.43],
									["Garage & Car Care", 39.41, 60.59],
									["Interior Accessories", 12.71, 87.29],
									["Motorcycle Parts", 21.74, 78.26],
									["Performance Parts", 11.22, 88.78],
									["Replacement Parts", 29.84, 70.16],
									["Shelters & RV", 20.13, 79.87],
									["Tires & Wheels", 9.52, 90.48],
									["Towing & Hitches", 16.86, 83.14]
								]
							}
						}, {
							"dataType": "html",
							"data": "<h4>Overview</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Subgroup is one of <b>the most significant influencers</b> of Opportunity Result and displays significant variation in distribution of Opportunity Result categories. The top 6 Subgroups including segment Exterior Accessories and segment Motorcycle Parts account for <b> 86.5% </b>of the total observations. <b>Segment Tires & Wheels</b> is the smallest with <b>just 0.42%</b> of the total observations. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Won</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> The <b>percentage of Won</b> is the <b> lowest for the segment Performance Parts</b> (11.2%). The segment <b> Garage & Car Care</b> has the <b>highest rate of Won</b> (39.4%), which is 251.3% higher than segment Performance Parts and 47.9% higher than the overall Won rate. Interestingly, the <b>segment Motorcycle Parts and segment Shelters & RV</b>, which cumulatively account for <b> 31.1% of the total </b>observations, has contributed to <b> 24.6% of total Won</b>. On the other hand, the segments <b>Exterior Accessories and Garage & Car Care</b> cumulatively account for <b>33.0% of the total</b> observations, but it has contributed to <b>43.7% of total Won</b>. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Loss</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> When it comes to <b>Loss, segment Garage & Car Care</b> seems to be the <b>least dominant segment</b> since 60.6% of its total observations are into Loss category. But,<b> segment Tires & Wheels</b> has the <b>highest rate of Loss</b> (90.5%). Interestingly, <b>segment Garage & Car Care and segment Exterior Accessories</b>, which cumulatively account for <b> 33.0% of the total </b>observations, have contributed to <b> 29.1% of total Loss</b>. On the other hand, the segments <b>Shelters & RV and Motorcycle Parts</b> cumulatively account for <b>31.1% of the total</b> observations, but it has contributed to <b>33.4% of total Loss</b>. </p>"
						}],
						"name": "Subgroup: Relationship with Opportunity Result",
						"slug": "subgroup-relationship-with-opportunity-result-4fwhufmti1"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Won) across Subgroup</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 131.31727983645294,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 27.82764811490126, 36.58536585365854, 32.569721115537845, 39.41267387944359, 12.711864406779661, 21.73913043478261, 11.21951219512195, 29.840142095914743, 20.130932896890343, 9.523809523809524, 16.86046511627907],
											["total", 155.0, 15.0, 327.0, 255.0, 30.0, 205.0, 23.0, 168.0, 123.0, 2.0, 29.0],
											["key", "Batteries & Accessories", "Car Electronics", "Exterior Accessories", "Garage & Car Care", "Interior Accessories", "Motorcycle Parts", "Performance Parts", "Replacement Parts", "Shelters & RV", "Tires & Wheels", "Towing & Hitches"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top 6 Subgroups(including segment Exterior Accessories and segment Garage & Car Care) account for 92.6% of the total Won observations. Being the largest contributor, total Won from Exterior Accessories amounts to 327.0 that accounts for about 24.6% of the total Won. On the other hand, Tires & Wheels contributes to just 0.15% of the total Won. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Won from Exterior Accessories</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> High concentration of Won from segment Exterior Accessories is characterized by the influence of key dimensions, such as Market Route, Competitor Type and Revenue. Certain specific segments from those factors are more likely to explain segment Exterior Accessories's significant rate of Won. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Market Route</b>: Reseller plays a key role in explaining the high concentration of Won from segment Exterior Accessories. It accounts for 66.1% of total Won from segment Exterior Accessories. The percentage of Won for Reseller is 40.7%. </li> </li> <li> <b>Competitor Type</b>: Among the Competitor Types, Unknown has got the major chunk of Won from segment Exterior Accessories, accounting for 72.8%. The percentage of Won for Unknown is 33.1%. </li> </li> <li> <b>Revenue</b>: Among the Revenues, 0 has got the major chunk of Won from segment Exterior Accessories, accounting for 78.9%. The percentage of Won for 0 is 28.7%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>24.5%</span><br /><small>Overall Won comes from Exterior Accessories</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>39.4%</span><br /><small>Garage & Car Care has the highest rate of Won</small></h2></div>"
						}],
						"name": "Subgroup : Distribution of Loss",
						"slug": "subgroup-distribution-of-loss-33ocoamthy"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Loss) across Subgroup</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 131.31727983645294,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 72.17235188509875, 63.41463414634146, 67.43027888446215, 60.58732612055641, 87.28813559322033, 78.26086956521739, 88.78048780487805, 70.15985790408526, 79.86906710310966, 90.47619047619048, 83.13953488372093],
											["total", 402.0, 26.0, 677.0, 392.0, 206.0, 738.0, 182.0, 395.0, 488.0, 19.0, 143.0],
											["key", "Batteries & Accessories", "Car Electronics", "Exterior Accessories", "Garage & Car Care", "Interior Accessories", "Motorcycle Parts", "Performance Parts", "Replacement Parts", "Shelters & RV", "Tires & Wheels", "Towing & Hitches"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top 2 Subgroups(segment Motorcycle Parts and segment Exterior Accessories) account for 38.6% of the total Loss observations. Being the largest contributor, total Loss from Motorcycle Parts amounts to 738.0 that accounts for about 20.1% of the total Loss. On the other hand, Tires & Wheels contributes to just 0.5% of the total Loss. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Loss from Motorcycle Parts</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> High concentration of Loss from segment Motorcycle Parts is characterized by the influence of key dimensions, such as Group, Market Route and Revenue. Certain specific segments from those factors are more likely to explain segment Motorcycle Parts's significant rate of Loss. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> </li> <li> <b>Market Route</b>: Among the Market Routes, the top 2 Market Routes, Reseller(44.58%) and Fields Sales(42.41%), contribute to 87.0% of the total Loss observations from segment Motorcycle Parts. The percentage of Loss for Reseller and Fields Sales are 72.2% and 83.9% respectively. </li> </li> <li> <b>Revenue</b>: 0 plays a key role in explaining the high concentration of Loss from segment Motorcycle Parts. It accounts for 96.8% of total Loss from segment Motorcycle Parts. The percentage of Loss for 0 is 81.3%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>20.1%</span><br /><small>Overall Loss comes from Motorcycle Parts</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>90.5%</span><br /><small>Tires & Wheels has the highest rate of Loss</small></h2></div>"
						}],
						"name": "Subgroup : Distribution of Won",
						"slug": "subgroup-distribution-of-won-b3syfhnwqo"
					}],
					"name": "Subgroup",
					"slug": "subgroup-xd4svohd9s"
				}, {
					"listOfNodes": [],
					"listOfCards": [{
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Relationship between Opportunity Result  and Group</h3>"
						}, {
							"dataType": "table",
							"data": {
								"tableType": "heatMap",
								"tableData": [
									["Group", "Won", "Loss"],
									["Car Accessories", 30.32, 69.68],
									["Car Electronics", 36.59, 63.41],
									["Performance & Non-auto", 19.95, 80.05],
									["Tires & Wheels", 9.52, 90.48]
								]
							}
						}, {
							"dataType": "html",
							"data": "<h4>Overview</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Group is one of <b>the most significant influencers</b> of Opportunity Result and displays significant variation in distribution of Opportunity Result categories. <b>Segment Car Accessories and segment Performance & Non-auto </b> are the two largest Groups, accounting for <b> 98.8% </b> of the total observations. <b>Segment Tires & Wheels</b> is the smallest with <b>just 0.42%</b> of the total observations. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Won</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> The <b>percentage of Won</b> is the <b> lowest for the segment Performance & Non-auto</b> (20.0%). The segment <b> Car Electronics</b> has the <b>highest rate of Won</b> (36.6%), which is 83.3% higher than segment Performance & Non-auto and 37.3% higher than the overall Won rate. Interestingly, the <b>segment Performance & Non-auto</b>, which accounts for <b>35.2% of the total </b>observations, has contributed to <b>26.4% of total Won</b>. On the other hand, the segment <b>Car Accessories</b> accounts for <b>63.6% of the total</b> observations, but it has contributed to <b>72.4% of total Won</b>. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Loss</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> When it comes to <b>Loss, segment Car Accessories</b> seems to be the <b>least dominant segment</b> since 69.7% of its total observations are into Loss category. But,<b> segment Tires & Wheels</b> has the <b>highest rate of Loss</b> (90.5%). Interestingly, <b>segment Car Accessories</b>, which accounts for <b>63.6% of the total </b>observations, has contributed to <b>60.4% of total Loss</b>. On the other hand, the segment <b>Performance & Non-auto</b> accounts for <b>35.2% of the total</b> observations, but it has contributed to <b>38.4% of total Loss</b>. </p>"
						}],
						"name": "Group: Relationship with Opportunity Result",
						"slug": "group-relationship-with-opportunity-result-tm96k9spup"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Won) across Group</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 127.78174593052022,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 30.324001258257315, 36.58536585365854, 19.954519613416714, 9.523809523809524],
											["total", 964.0, 15.0, 351.0, 2.0],
											["key", "Car Accessories", "Car Electronics", "Performance & Non-auto", "Tires & Wheels"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Group(segment Car Accessories) accounts for 72.4% of the total Won observations. The segment Tires & Wheels contributes to just 0.15% of the total Won. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Won from Car Accessories</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> There are some key factors(Competitor Type, Revenue and Region) that explain why the concentration of Won from segment Car Accessories is very high. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Competitor Type</b>: Unknown plays a key role in explaining the high concentration of Won from segment Car Accessories. It accounts for 74.5% of total Won from segment Car Accessories. The percentage of Won for Unknown is 31.7%. </li> </li> <li> <b>Revenue</b>: 0 plays a key role in explaining the high concentration of Won from segment Car Accessories. It accounts for 80.5% of total Won from segment Car Accessories. The percentage of Won for 0 is 26.9%. </li> </li> <li> <b>Region</b>: Midwest plays a key role in explaining the high concentration of Won from segment Car Accessories. It accounts for 55.5% of total Won from segment Car Accessories. The percentage of Won for Midwest is 32.8%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>72.4%</span><br /><small>Overall Won comes from Car Accessories</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>36.6%</span><br /><small>Car Electronics has the highest rate of Won</small></h2></div>"
						}],
						"name": "Group : Distribution of Loss",
						"slug": "group-distribution-of-loss-db0vwvwnvx"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Loss) across Group</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 127.78174593052022,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 69.67599874174269, 63.41463414634146, 80.0454803865833, 90.47619047619048],
											["total", 2215.0, 26.0, 1408.0, 19.0],
											["key", "Car Accessories", "Car Electronics", "Performance & Non-auto", "Tires & Wheels"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top 2 Groups(segment Car Accessories and segment Performance & Non-auto) account for 98.8% of the total Loss observations. Being the largest contributor, total Loss from Car Accessories amounts to 2,215.0 that accounts for about 60.4% of the total Loss. On the other hand, Tires & Wheels contributes to just 0.5% of the total Loss. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Loss from Car Accessories</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> There are some key factors(Market Route, Region and Revenue) that explain why the concentration of Loss from segment Car Accessories is very high. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Market Route</b>: Some of the Market Route(Fields Sales(53.59%) and Reseller(39.32%)) account of a significant portion of Loss observations from segment Car Accessories. They cumulatively account for about 92.9% of the total Loss from segment Car Accessories. The percentage of Loss for Fields Sales and Reseller are 80.4% and 59.0% respectively. </li> </li> <li> <b>Region</b>: Among the Regions, Midwest has got the major chunk of Loss from segment Car Accessories, accounting for 49.5%. The percentage of Loss for Midwest is 67.2%. </li> </li> <li> <b>Revenue</b>: Among the Revenues, 0 has got the major chunk of Loss from segment Car Accessories, accounting for 95.3%. The percentage of Loss for 0 is 73.1%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>60.4%</span><br /><small>Overall Loss comes from Car Accessories</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>90.5%</span><br /><small>Tires & Wheels has the highest rate of Loss</small></h2></div>"
						}],
						"name": "Group : Distribution of Won",
						"slug": "group-distribution-of-won-fqx68ry9mz"
					}],
					"name": "Group",
					"slug": "group-jpb8kzzdt0"
				}, {
					"listOfNodes": [],
					"listOfCards": [{
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Relationship between Opportunity Result  and Competitor Type</h3>"
						}, {
							"dataType": "table",
							"data": {
								"tableType": "heatMap",
								"tableData": [
									["Competitor Type", "Won", "Loss"],
									["Known", 20.1, 79.9],
									["None", 34.63, 65.37],
									["Unknown", 27.7, 72.3]
								]
							}
						}, {
							"dataType": "html",
							"data": "<h4>Overview</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Competitor Type is one of <b>the most significant influencers</b> of Opportunity Result and displays significant variation in distribution of Opportunity Result categories. <b>Segment Unknown </b> is the largest Competitor Type, accounting for almost<b> 71.3% of the total </b>observations. <b>Segment None</b> is the smallest with <b>just 7.74%</b> of the total observations. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Won</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> The <b>percentage of Won</b> is the <b> lowest for the segment Known</b> (20.1%). The segment <b> None</b> has the <b>highest rate of Won</b> (34.6%), which is 72.3% higher than segment Known and 30.0% higher than the overall Won rate. Interestingly, the <b>segment Known</b>, which accounts for <b>21.0% of the total </b>observations, has contributed to <b>15.8% of total Won</b>. On the other hand, the segment <b>Unknown</b> accounts for <b>71.3% of the total</b> observations, but it has contributed to <b>74.1% of total Won</b>. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Loss</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> When it comes to <b>Loss, segment None</b> seems to be the <b>least dominant segment</b> since 65.4% of its total observations are into Loss category. But,<b> segment Known</b> has the <b>highest rate of Loss</b> (79.9%). Interestingly, <b>segment Unknown</b>, which accounts for <b>71.3% of the total </b>observations, has contributed to <b>70.2% of total Loss</b>. On the other hand, the segment <b>Known</b> accounts for <b>21.0% of the total</b> observations, but it has contributed to <b>22.9% of total Loss</b>. </p>"
						}],
						"name": "Competitor Type: Relationship with Opportunity Result",
						"slug": "competitor-type-relationship-with-opportunity-result-oeh48rpo82"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Won) across Competitor Type</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 74.74873734152916,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 20.095238095238095, 34.62532299741602, 27.701375245579566],
											["total", 211.0, 134.0, 987.0],
											["key", "Known", "None", "Unknown"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Competitor Type(segment Unknown) accounts for 74.1% of the total Won observations. The segment None contributes to just 10.06% of the total Won. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Won from Unknown</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Market Route, Subgroup and Size By Revenue are some of the most important factors that describe the concentration of Won from segment Unknown Value category. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Market Route</b>: Reseller plays a key role in explaining the high concentration of Won from segment Unknown. It accounts for 76.3% of total Won from segment Unknown. The percentage of Won for Reseller is 38.2%. </li> </li> <li> <b>Subgroup</b>: Some of the Subgroups(including Exterior Accessories(24.1%) and Garage & Car Care(20.8%)) account for a significant portion of Won observations from segment Unknown. They cumulatively account for about 93.4% of the total Won from segment Unknown. The percentage of Won for Exterior Accessories and Garage & Car Care are 33.1% and 41.8% respectively. </li> </li> <li> <b>Size By Revenue</b>: Among the Size By Revenues, Less than 1M has got the major chunk of Won from segment Unknown, accounting for 52.5%. The percentage of Won for Less than 1M is 28.6%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>74.1%</span><br /><small>Overall Won comes from Unknown</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>34.6%</span><br /><small>None has the highest rate of Won</small></h2></div>"
						}],
						"name": "Competitor Type : Distribution of Loss",
						"slug": "competitor-type-distribution-of-loss-pcb1lyop6h"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Loss) across Competitor Type</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 74.74873734152916,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 79.9047619047619, 65.37467700258398, 72.29862475442043],
											["total", 839.0, 253.0, 2576.0],
											["key", "Known", "None", "Unknown"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Competitor Type(segment Unknown) account for 70.2% of the total Loss observations. The segment None contributes to just 6.9% of the total Loss. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Loss from Unknown</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Market Route, Group and Region are some of the most important factors that describe the concentration of Loss from segment Unknown Value category. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Market Route</b>: Among the Market Routes, the top 2 Market Routes, Reseller(47.24%) and Fields Sales(44.45%), contribute to 91.7% of the total Loss observations from segment Unknown. The percentage of Loss for Reseller and Fields Sales are 61.8% and 85.1% respectively. </li> </li> <li> <b>Group</b>: Among the Groups, the top 2 Groups, Car Accessories(60.05%) and Performance & Non-auto(38.47%), contribute to 98.5% of the total Loss observations from segment Unknown. The percentage of Loss for Car Accessories and Performance & Non-auto are 68.3% and 79.6% respectively. </li> </li> <li> <b>Region</b>: Among the Regions, Midwest has got the major chunk of Loss from segment Unknown, accounting for 50.5%. The percentage of Loss for Midwest is 69.7%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>70.2%</span><br /><small>Overall Loss comes from Unknown</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>79.9%</span><br /><small>Known has the highest rate of Loss</small></h2></div>"
						}],
						"name": "Competitor Type : Distribution of Won",
						"slug": "competitor-type-distribution-of-won-tlh8kurgx1"
					}],
					"name": "Competitor Type",
					"slug": "competitor-type-5nwiggay6r"
				}, {
					"listOfNodes": [],
					"listOfCards": [{
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Relationship between Opportunity Result  and Sales Stage Change Count</h3>"
						}, {
							"dataType": "table",
							"data": {
								"tableType": "heatMap",
								"tableData": [
									["Sales Stage Change Count", "Won", "Loss"],
									["1 to 5.4", 25.4, 74.6],
									["5.4 to 9.8", 37.35, 62.65],
									["9.8 to 14.2", 30.61, 69.39],
									["14.2 to 18.6", 0.0, 100.0],
									["18.6 to 23", 0.0, 100.0]
								]
							}
						}, {
							"dataType": "html",
							"data": "<h4>Overview</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Sales Stage Change Count is one of <b>the most significant influencers</b> of Opportunity Result and displays significant variation in distribution of Opportunity Result categories. <b>Segment 1 to 5.4 </b> is the largest Sales Stage Change Count, accounting for almost<b> 88.8% of the total </b>observations. <b>Segment 18.6 to 23 and segment 14.2 to 18.6</b> are the smallest with <b>just 0.04%</b> of the total observations. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Won</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> The <b>percentage of Won</b> is the <b> lowest for the segment 1 to 5.4</b> (25.4%). The segment <b> 5.4 to 9.8</b> has the <b>highest rate of Won</b> (37.4%), which is 47.1% higher than segment 1 to 5.4 and 40.2% higher than the overall Won rate. Interestingly, the <b>segment 1 to 5.4</b>, which accounts for <b>88.8% of the total </b>observations, has contributed to <b>84.7% of total Won</b>. On the other hand, the segment <b>5.4 to 9.8</b> accounts for <b>10.1% of the total</b> observations, but it has contributed to <b>14.2% of total Won</b>. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Loss</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> When it comes to <b>Loss, segment 5.4 to 9.8</b> seems to be the <b>least dominant segment</b> since 62.6% of its total observations are into Loss category. But,<b> segment 14.2 to 18.6 and segment 18.6 to 23</b> have the <b>highest rate of Loss</b> (100.0%). Interestingly, <b>segment 5.4 to 9.8 and segment 9.8 to 14.2</b>, which cumulatively account for <b> 11.1% of the total </b>observations, have contributed to <b> 9.6% of total Loss</b>. On the other hand, the segment <b>1 to 5.4</b> accounts for <b>88.8% of the total</b> observations, but it has contributed to <b>90.3% of total Loss</b>. </p>"
						}],
						"name": "Sales Stage Change Count: Relationship with Opportunity Result",
						"slug": "sales-stage-change-count-relationship-with-opportunity-result-4xmqok7grh"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Won) across Sales Stage Change Count</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 92.42640687119285,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 25.399684755685655, 37.351778656126484, 30.612244897959183, 0.0, 0.0],
											["total", 1128.0, 189.0, 15.0, 0.0, 0.0],
											["key", "1 to 5.4", "5.4 to 9.8", "9.8 to 14.2", "14.2 to 18.6", "18.6 to 23"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Sales Stage Change Count(segment 1 to 5.4) accounts for 84.7% of the total Won observations. The segment 14.2 to 18.6 contributes to just 0.0% of the total Won. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Won from 1 to 5.4</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Size By Employees, Revenue and Size By Revenue are some of the most important factors that describe the concentration of Won from segment 1 to 5.4 Value category. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Size By Employees</b>: Less than 1k plays a key role in explaining the high concentration of Won from segment 1 to 5.4. It accounts for 52.8% of total Won from segment 1 to 5.4. The percentage of Won for Less than 1k is 28.4%. </li> </li> <li> <b>Revenue</b>: Among the Revenues, 0 has got the major chunk of Won from segment 1 to 5.4, accounting for 81.7%. The percentage of Won for 0 is 22.6%. </li> </li> <li> <b>Size By Revenue</b>: Among the Size By Revenues, Less than 1M has got the major chunk of Won from segment 1 to 5.4, accounting for 53.0%. The percentage of Won for Less than 1M is 27.2%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>84.7%</span><br /><small>Overall Won comes from 1 to 5.4</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>37.4%</span><br /><small>5.4 to 9.8 has the highest rate of Won</small></h2></div>"
						}],
						"name": "Sales Stage Change Count : Distribution of Loss",
						"slug": "sales-stage-change-count-distribution-of-loss-0j95bfaibi"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Loss) across Sales Stage Change Count</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 92.42640687119285,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 74.60031524431434, 62.648221343873516, 69.38775510204081, 100.0, 100.0],
											["total", 3313.0, 317.0, 34.0, 2.0, 2.0],
											["key", "1 to 5.4", "5.4 to 9.8", "9.8 to 14.2", "14.2 to 18.6", "18.6 to 23"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Sales Stage Change Count(segment 1 to 5.4) account for 90.3% of the total Loss observations. The segment 14.2 to 18.6 contributes to just 0.1% of the total Loss. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Loss from 1 to 5.4</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Region, Competitor Type and Size By Revenue are some of the most important factors that describe the concentration of Loss from segment 1 to 5.4 Value category. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Region</b>: Midwest plays a key role in explaining the high concentration of Loss from segment 1 to 5.4. It accounts for 49.1% of total Loss from segment 1 to 5.4. The percentage of Loss for Midwest is 73.3%. </li> </li> <li> <b>Competitor Type</b>: Among the Competitor Types, Unknown has got the major chunk of Loss from segment 1 to 5.4, accounting for 70.9%. The percentage of Loss for Unknown is 73.4%. </li> </li> <li> <b>Size By Revenue</b>: Less than 1M plays a key role in explaining the high concentration of Loss from segment 1 to 5.4. It accounts for 48.2% of total Loss from segment 1 to 5.4. The percentage of Loss for Less than 1M is 72.8%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>90.3%</span><br /><small>Overall Loss comes from 1 to 5.4</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>100.0%</span><br /><small>14.2 to 18.6 has the highest rate of Loss</small></h2></div>"
						}],
						"name": "Sales Stage Change Count : Distribution of Won",
						"slug": "sales-stage-change-count-distribution-of-won-6s2s7t72x0"
					}],
					"name": "Sales Stage Change Count",
					"slug": "sales-stage-change-count-q4yc0h0six"
				}, {
					"listOfNodes": [],
					"listOfCards": [{
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Relationship between Opportunity Result  and Amount USD</h3>"
						}, {
							"dataType": "table",
							"data": {
								"tableType": "heatMap",
								"tableData": [
									["Amount USD", "Won", "Loss"],
									["0 to 200,000", 26.92, 73.08],
									["200,000 to 400,000", 18.6, 81.4],
									["400,000 to 600,000", 35.09, 64.91],
									["600,000 to 800,000", 46.51, 53.49],
									["800,000 to 1,000,000", 42.31, 57.69]
								]
							}
						}, {
							"dataType": "html",
							"data": "<h4>Overview</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Amount USD is one of <b>the most significant influencers</b> of Opportunity Result and displays significant variation in distribution of Opportunity Result categories. <b>Segment 0 to 200,000 </b> is the largest Amount USD, accounting for almost<b> 87.7% of the total </b>observations. <b>Segment 800,000 to 1,000,000</b> is the smallest with <b>just 0.52%</b> of the total observations. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Won</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> The <b>percentage of Won</b> is the <b> lowest for the segment 200,000 to 400,000</b> (18.6%). The segment <b> 600,000 to 800,000</b> has the <b>highest rate of Won</b> (46.5%), which is 150.0% higher than segment 200,000 to 400,000 and 74.6% higher than the overall Won rate. Interestingly, the <b>segment 200,000 to 400,000 and segment 800,000 to 1,000,000</b>, which cumulatively account for <b> 9.1% of the total </b>observations, has contributed to <b> 6.8% of total Won</b>. On the other hand, the segment <b>0 to 200,000</b> accounts for <b>87.7% of the total</b> observations, but it has contributed to <b>88.7% of total Won</b>. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Loss</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> When it comes to <b>Loss, segment 400,000 to 600,000</b> seems to be the <b>least dominant segment</b> since 64.9% of its total observations are into Loss category. But,<b> segment 200,000 to 400,000</b> has the <b>highest rate of Loss</b> (81.4%). Interestingly, <b>segment 0 to 200,000</b>, which accounts for <b>87.7% of the total </b>observations, has contributed to <b>87.4% of total Loss</b>. On the other hand, the segment <b>200,000 to 400,000</b> accounts for <b>8.6% of the total</b> observations, but it has contributed to <b>9.5% of total Loss</b>. </p>"
						}],
						"name": "Amount USD: Relationship with Opportunity Result",
						"slug": "amount-usd-relationship-with-opportunity-result-v30m7c0s16"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Won) across Amount USD</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 120.71067811865474,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 26.920446774561203, 18.6046511627907, 35.08771929824562, 46.51162790697674, 42.30769230769231],
											["total", 1181.0, 80.0, 40.0, 20.0, 11.0],
											["key", "0 to 200,000", "200,000 to 400,000", "400,000 to 600,000", "600,000 to 800,000", "800,000 to 1,000,000"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Amount USD(segment 0 to 200,000) accounts for 88.7% of the total Won observations. The segment 800,000 to 1,000,000 contributes to just 0.83% of the total Won. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Won from 0 to 200,000</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> There are some key factors(Competitor Type, Size By Revenue and Market Route) that explain why the concentration of Won from segment 0 to 200,000 is very high. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Competitor Type</b>: Among the Competitor Types, Unknown has got the major chunk of Won from segment 0 to 200,000, accounting for 74.8%. The percentage of Won for Unknown is 27.4%. </li> </li> <li> <b>Size By Revenue</b>: Among the Size By Revenues, Less than 1M has got the major chunk of Won from segment 0 to 200,000, accounting for 52.8%. The percentage of Won for Less than 1M is 28.4%. </li> </li> <li> <b>Market Route</b>: Among the Market Routes, Reseller has got the major chunk of Won from segment 0 to 200,000, accounting for 65.3%. The percentage of Won for Reseller is 36.4%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>88.7%</span><br /><small>Overall Won comes from 0 to 200,000</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>46.5%</span><br /><small>600,000 to 800,000 has the highest rate of Won</small></h2></div>"
						}],
						"name": "Amount USD : Distribution of Loss",
						"slug": "amount-usd-distribution-of-loss-oq3ygeq619"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Loss) across Amount USD</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 120.71067811865474,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 73.0795532254388, 81.3953488372093, 64.91228070175438, 53.48837209302326, 57.69230769230769],
											["total", 3206.0, 350.0, 74.0, 23.0, 15.0],
											["key", "0 to 200,000", "200,000 to 400,000", "400,000 to 600,000", "600,000 to 800,000", "800,000 to 1,000,000"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Amount USD(segment 0 to 200,000) account for 87.4% of the total Loss observations. The segment 800,000 to 1,000,000 contributes to just 0.4% of the total Loss. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Loss from 0 to 200,000</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> There are some key factors(Market Route, Size By Employees and Revenue) that explain why the concentration of Loss from segment 0 to 200,000 is very high. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Market Route</b>: Among the Market Routes, the top 2 Market Routes, Fields Sales(48.91%) and Reseller(42.05%), contribute to 91.0% of the total Loss observations from segment 0 to 200,000. The percentage of Loss for Fields Sales and Reseller are 83.0% and 63.6% respectively. </li> </li> <li> <b>Size By Employees</b>: Among the Size By Employees, Less than 1k has got the major chunk of Loss from segment 0 to 200,000, accounting for 45.0%. The percentage of Loss for Less than 1k is 70.6%. </li> </li> <li> <b>Revenue</b>: Among the Revenues, 0 has got the major chunk of Loss from segment 0 to 200,000, accounting for 96.0%. The percentage of Loss for 0 is 76.1%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>87.4%</span><br /><small>Overall Loss comes from 0 to 200,000</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>81.4%</span><br /><small>200,000 to 400,000 has the highest rate of Loss</small></h2></div>"
						}],
						"name": "Amount USD : Distribution of Won",
						"slug": "amount-usd-distribution-of-won-wmcms4g7zt"
					}],
					"name": "Amount USD",
					"slug": "amount-usd-t86v58rwui"
				}, {
					"listOfNodes": [],
					"listOfCards": [{
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Relationship between Opportunity Result  and Size By Employees</h3>"
						}, {
							"dataType": "table",
							"data": {
								"tableType": "heatMap",
								"tableData": [
									["Size By Employees", "Won", "Loss"],
									["Less than 1k", 29.32, 70.68],
									["1k to 5k", 26.41, 73.59],
									["5k to 10k", 25.37, 74.63],
									["10k to 30k", 24.64, 75.36],
									["More than 30k", 21.37, 78.63]
								]
							}
						}, {
							"dataType": "html",
							"data": "<h4>Overview</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Size By Employees is one of <b>the most significant influencers</b> of Opportunity Result and displays significant variation in distribution of Opportunity Result categories. <b>Segment Less than 1k </b> is the largest Size By Employees, accounting for almost<b> 46.4% of the total </b>observations. <b>Segment 1k to 5k</b> is the smallest with <b>just 11.74%</b> of the total observations. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Won</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> The <b>percentage of Won</b> is the <b> lowest for the segment More than 30k</b> (21.4%). The segment <b> Less than 1k</b> has the <b>highest rate of Won</b> (29.3%), which is 37.2% higher than segment More than 30k and 10.1% higher than the overall Won rate. Interestingly, the <b>segment More than 30k and segment 10k to 30k</b>, which cumulatively account for <b> 28.3% of the total </b>observations, has contributed to <b> 24.4% of total Won</b>. On the other hand, the segment <b>Less than 1k</b> accounts for <b>46.4% of the total</b> observations, but it has contributed to <b>51.1% of total Won</b>. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Loss</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> When it comes to <b>Loss, segment Less than 1k</b> seems to be the <b>least dominant segment</b> since 70.7% of its total observations are into Loss category. But,<b> segment More than 30k</b> has the <b>highest rate of Loss</b> (78.6%). Interestingly, <b>segment Less than 1k</b>, which accounts for <b>46.4% of the total </b>observations, has contributed to <b>44.7% of total Loss</b>. On the other hand, the segment <b>More than 30k</b> accounts for <b>14.6% of the total</b> observations, but it has contributed to <b>15.6% of total Loss</b>. </p>"
						}],
						"name": "Size By Employees: Relationship with Opportunity Result",
						"slug": "size-by-employees-relationship-with-opportunity-result-4lhveym9zx"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Won) across Size By Employees</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 95.96194077712559,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 29.322984044846915, 26.405451448040886, 25.36873156342183, 24.635568513119534, 21.36986301369863],
											["total", 680.0, 155.0, 172.0, 169.0, 156.0],
											["key", "Less than 1k", "1k to 5k", "5k to 10k", "10k to 30k", "More than 30k"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Size By Employees(segment Less than 1k) accounts for 51.1% of the total Won observations. The segment 1k to 5k contributes to just 11.64% of the total Won. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Won from Less than 1k</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> High concentration of Won from segment Less than 1k is characterized by the influence of key dimensions, such as Size By Revenue, Competitor Type and Revenue. Certain specific segments from those factors are more likely to explain segment Less than 1k's significant rate of Won. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Size By Revenue</b>: Among the Size By Revenues, Less than 1M has got the major chunk of Won from segment Less than 1k, accounting for 73.5%. The percentage of Won for Less than 1M is 29.8%. </li> </li> <li> <b>Competitor Type</b>: Unknown plays a key role in explaining the high concentration of Won from segment Less than 1k. It accounts for 75.9% of total Won from segment Less than 1k. The percentage of Won for Unknown is 29.8%. </li> </li> <li> <b>Revenue</b>: 0 plays a key role in explaining the high concentration of Won from segment Less than 1k. It accounts for 83.5% of total Won from segment Less than 1k. The percentage of Won for 0 is 26.4%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>51.1%</span><br /><small>Overall Won comes from Less than 1k</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>29.3%</span><br /><small>Less than 1k has the highest rate of Won</small></h2></div>"
						}],
						"name": "Size By Employees : Distribution of Loss",
						"slug": "size-by-employees-distribution-of-loss-vd339jpq84"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Loss) across Size By Employees</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 95.96194077712559,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 70.67701595515308, 73.59454855195911, 74.63126843657817, 75.36443148688046, 78.63013698630137],
											["total", 1639.0, 432.0, 506.0, 517.0, 574.0],
											["key", "Less than 1k", "1k to 5k", "5k to 10k", "10k to 30k", "More than 30k"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Size By Employees(segment Less than 1k) account for 44.7% of the total Loss observations. The segment 1k to 5k contributes to just 11.8% of the total Loss. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Loss from Less than 1k</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> High concentration of Loss from segment Less than 1k is characterized by the influence of key dimensions, such as Revenue, Group and Competitor Type. Certain specific segments from those factors are more likely to explain segment Less than 1k's significant rate of Loss. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Revenue</b>: Among the Revenues, 0 has got the major chunk of Loss from segment Less than 1k, accounting for 96.5%. The percentage of Loss for 0 is 73.6%. </li> </li> <li> <b>Group</b>: Among the Groups, the top 2 Groups, Car Accessories(60.89%) and Performance & Non-auto(38.01%), contribute to 98.9% of the total Loss observations from segment Less than 1k. The percentage of Loss for Car Accessories and Performance & Non-auto are 66.8% and 78.1% respectively. </li> </li> <li> <b>Competitor Type</b>: Among the Competitor Types, Unknown has got the major chunk of Loss from segment Less than 1k, accounting for 74.1%. The percentage of Loss for Unknown is 70.2%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>44.7%</span><br /><small>Overall Loss comes from Less than 1k</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>78.6%</span><br /><small>More than 30k has the highest rate of Loss</small></h2></div>"
						}],
						"name": "Size By Employees : Distribution of Won",
						"slug": "size-by-employees-distribution-of-won-qhon201d0e"
					}],
					"name": "Size By Employees",
					"slug": "size-by-employees-8dnxnvepc4"
				}, {
					"listOfNodes": [],
					"listOfCards": [{
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Relationship between Opportunity Result  and Region</h3>"
						}, {
							"dataType": "table",
							"data": {
								"tableType": "heatMap",
								"tableData": [
									["Region", "Won", "Loss"],
									["Midwest", 28.31, 71.69],
									["Northwest", 21.14, 78.86],
									["Pacific", 27.27, 72.73]
								]
							}
						}, {
							"dataType": "html",
							"data": "<h4>Overview</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Region is one of <b>the most significant influencers</b> of Opportunity Result and displays significant variation in distribution of Opportunity Result categories. <b>Segment Midwest </b> is the largest Region, accounting for almost<b> 50.9% of the total </b>observations. <b>Segment Northwest</b> is the smallest with <b>just 18.92%</b> of the total observations. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Won</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> The <b>percentage of Won</b> is the <b> lowest for the segment Northwest</b> (21.1%). The segment <b> Midwest</b> has the <b>highest rate of Won</b> (28.3%), which is 33.9% higher than segment Northwest and 6.3% higher than the overall Won rate. Interestingly, the <b>segment Northwest</b>, which accounts for <b>18.9% of the total </b>observations, has contributed to <b>15.0% of total Won</b>. On the other hand, the segment <b>Midwest</b> accounts for <b>50.9% of the total</b> observations, but it has contributed to <b>54.1% of total Won</b>. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Loss</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> When it comes to <b>Loss, segment Midwest</b> seems to be the <b>least dominant segment</b> since 71.7% of its total observations are into Loss category. But,<b> segment Northwest</b> has the <b>highest rate of Loss</b> (78.9%). Interestingly, <b>segment Midwest</b>, which accounts for <b>50.9% of the total </b>observations, has contributed to <b>49.8% of total Loss</b>. On the other hand, the segment <b>Northwest</b> accounts for <b>18.9% of the total</b> observations, but it has contributed to <b>20.3% of total Loss</b>. </p>"
						}],
						"name": "Region: Relationship with Opportunity Result",
						"slug": "region-relationship-with-opportunity-result-4ew9m68osh"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Won) across Region</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 81.81980515339464,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 28.307813113466825, 21.141649048625794, 27.272727272727273],
											["total", 721.0, 200.0, 411.0],
											["key", "Midwest", "Northwest", "Pacific"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Region(segment Midwest) accounts for 54.1% of the total Won observations. The segment Northwest contributes to just 15.02% of the total Won. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Won from Midwest</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> High concentration of Won from segment Midwest is characterized by the influence of key dimensions, such as Subgroup, Size By Revenue and Deal Size Category. Certain specific segments from those factors are more likely to explain segment Midwest's significant rate of Won. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Subgroup</b>: Some of the Subgroups(Exterior Accessories(25.7%) and Garage & Car Care(25.0%)) account for a significant portion of Won observations from segment Midwest. They cumulatively account for about 50.6% of the total Won from segment Midwest. The percentage of Won for Exterior Accessories and Garage & Car Care are 36.5% and 43.9% respectively. </li> </li> <li> <b>Size By Revenue</b>: Less than 1M plays a key role in explaining the high concentration of Won from segment Midwest. It accounts for 47.6% of total Won from segment Midwest. The percentage of Won for Less than 1M is 29.9%. </li> </li> <li> <b>Deal Size Category</b>: Among the Deal Size Categories, the top 2 Deal Size Categories, 10k to 25k(27.0%) and Less than 10k(25.9%), contribute to 53.0% of the total Won observations from segment Midwest. The percentage of Won for 10k to 25k and Less than 10k are 36.8% and 42.4% respectively. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>54.1%</span><br /><small>Overall Won comes from Midwest</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>28.3%</span><br /><small>Midwest has the highest rate of Won</small></h2></div>"
						}],
						"name": "Region : Distribution of Loss",
						"slug": "region-distribution-of-loss-wyigd3j8bg"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Loss) across Region</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 81.81980515339464,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 71.69218688653318, 78.8583509513742, 72.72727272727273],
											["total", 1826.0, 746.0, 1096.0],
											["key", "Midwest", "Northwest", "Pacific"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Region(segment Midwest) account for 49.8% of the total Loss observations. The segment Northwest contributes to just 20.3% of the total Loss. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Loss from Midwest</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> High concentration of Loss from segment Midwest is characterized by the influence of key dimensions, such as Competitor Type, Size By Revenue and Revenue. Certain specific segments from those factors are more likely to explain segment Midwest's significant rate of Loss. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Competitor Type</b>: Among the Competitor Types, Unknown has got the major chunk of Loss from segment Midwest, accounting for 71.3%. The percentage of Loss for Unknown is 69.7%. </li> </li> <li> <b>Size By Revenue</b>: Among the Size By Revenues, Less than 1M has got the major chunk of Loss from segment Midwest, accounting for 44.0%. The percentage of Loss for Less than 1M is 70.1%. </li> </li> <li> <b>Revenue</b>: Among the Revenues, 0 has got the major chunk of Loss from segment Midwest, accounting for 93.8%. The percentage of Loss for 0 is 74.8%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>49.8%</span><br /><small>Overall Loss comes from Midwest</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>78.9%</span><br /><small>Northwest has the highest rate of Loss</small></h2></div>"
						}],
						"name": "Region : Distribution of Won",
						"slug": "region-distribution-of-won-a6gnu53oq1"
					}],
					"name": "Region",
					"slug": "region-mz042qiyvj"
				}, {
					"listOfNodes": [],
					"listOfCards": [{
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Relationship between Opportunity Result  and Size By Revenue</h3>"
						}, {
							"dataType": "table",
							"data": {
								"tableType": "heatMap",
								"tableData": [
									["Size By Revenue", "Won", "Loss"],
									["Less than 1M", 28.16, 71.84],
									["1M to 10M", 22.55, 77.45],
									["10M to 50M", 26.03, 73.97],
									["50M to 100M", 28.43, 71.57],
									["More than 100M", 23.09, 76.91]
								]
							}
						}, {
							"dataType": "html",
							"data": "<h4>Overview</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Size By Revenue is one of <b>the most significant influencers</b> of Opportunity Result and displays significant variation in distribution of Opportunity Result categories. <b>Segment Less than 1M </b> is the largest Size By Revenue, accounting for almost<b> 49.0% of the total </b>observations. <b>Segment 1M to 10M</b> is the smallest with <b>just 8.78%</b> of the total observations. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Won</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> The <b>percentage of Won</b> is the <b> lowest for the segment 1M to 10M</b> (22.6%). The segment <b> 50M to 100M</b> has the <b>highest rate of Won</b> (28.4%), which is 26.1% higher than segment 1M to 10M and 6.7% higher than the overall Won rate. Interestingly, the <b>segment More than 100M and segment 1M to 10M</b>, which cumulatively account for <b> 25.0% of the total </b>observations, has contributed to <b> 21.5% of total Won</b>. On the other hand, the segment <b>Less than 1M</b> accounts for <b>49.0% of the total</b> observations, but it has contributed to <b>51.8% of total Won</b>. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key segments of Loss</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> When it comes to <b>Loss, segment 50M to 100M</b> seems to be the <b>least dominant segment</b> since 71.6% of its total observations are into Loss category. But,<b> segment 1M to 10M</b> has the <b>highest rate of Loss</b> (77.4%). Interestingly, <b>segment Less than 1M</b>, which accounts for <b>49.0% of the total </b>observations, has contributed to <b>48.0% of total Loss</b>. On the other hand, the segment <b>More than 100M</b> accounts for <b>16.2% of the total</b> observations, but it has contributed to <b>17.0% of total Loss</b>. </p>"
						}],
						"name": "Size By Revenue: Relationship with Opportunity Result",
						"slug": "size-by-revenue-relationship-with-opportunity-result-kudw0sm81j"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Won) across Size By Revenue</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 99.49747468305833,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 28.163265306122447, 22.55125284738041, 26.03448275862069, 28.43273231622746, 23.08641975308642],
											["total", 690.0, 99.0, 151.0, 205.0, 187.0],
											["key", "Less than 1M", "1M to 10M", "10M to 50M", "50M to 100M", "More than 100M"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Size By Revenue(segment Less than 1M) accounts for 51.8% of the total Won observations. The segment 1M to 10M contributes to just 7.43% of the total Won. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Won from Less than 1M</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Revenue, Market Route and Competitor Type are some of the most important factors that describe the concentration of Won from segment Less than 1M Value category. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Revenue</b>: Among the Revenues, 0 has got the major chunk of Won from segment Less than 1M, accounting for 84.2%. The percentage of Won for 0 is 25.4%. </li> </li> <li> <b>Market Route</b>: Among the Market Routes, Reseller has got the major chunk of Won from segment Less than 1M, accounting for 65.1%. The percentage of Won for Reseller is 36.1%. </li> </li> <li> <b>Competitor Type</b>: Unknown plays a key role in explaining the high concentration of Won from segment Less than 1M. It accounts for 75.1% of total Won from segment Less than 1M. The percentage of Won for Unknown is 28.6%. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>51.8%</span><br /><small>Overall Won comes from Less than 1M</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>28.4%</span><br /><small>50M to 100M has the highest rate of Won</small></h2></div>"
						}],
						"name": "Size By Revenue : Distribution of Loss",
						"slug": "size-by-revenue-distribution-of-loss-40dtwci9g1"
					}, {
						"cardWidth": 100,
						"cardType": "normal",
						"cardData": [{
							"dataType": "html",
							"data": "<h3>Distribution of Opportunity Result (Loss) across Size By Revenue</h3>"
						}, {
							"dataType": "c3Chart",
							"data": {
								"chart_c3": {
									"bar": {
										"width": {
											"ratio": 0.5
										}
									},
									"point": null,
									"color": {
										"pattern": ["#005662", "#0fc4b5", "#148071", "#6cba86", "#bcf3a2"]
									},
									"tooltip": {
										"show": true
									},
									"padding": {
										"top": 40
									},
									"grid": {
										"y": {
											"show": true
										},
										"x": {
											"show": true
										}
									},
									"subchart": null,
									"axis": {
										"y": {
											"tick": {
												"outer": false,
												"format": ".2s"
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										},
										"x": {
											"height": 99.49747468305833,
											"tick": {
												"rotate": -45,
												"multiline": false,
												"fit": false
											},
											"type": "category",
											"label": {
												"text": "",
												"position": "outer-center"
											}
										},
										"y2": {
											"show": true,
											"tick": {
												"format": ""
											},
											"label": {
												"text": "",
												"position": "outer-middle"
											}
										}
									},
									"data": {
										"x": "key",
										"axes": {
											"percentage": "y2"
										},
										"type": "combination",
										"columns": [
											["percentage", 71.83673469387755, 77.44874715261959, 73.96551724137932, 71.56726768377254, 76.91358024691358],
											["total", 1760.0, 340.0, 429.0, 516.0, 623.0],
											["key", "Less than 1M", "1M to 10M", "10M to 50M", "50M to 100M", "More than 100M"]
										],
										"types": {
											"percentage": "line",
											"total": "bar"
										}
									},
									"legend": {
										"show": true
									},
									"size": {
										"height": 340
									}
								},
								"yformat": ".2s",
								"y2format": ""
							}
						}, {
							"dataType": "html",
							"data": "<p class = \"txt-justify\"> The top Size By Revenue(segment Less than 1M) account for 48.0% of the total Loss observations. The segment 1M to 10M contributes to just 9.3% of the total Loss. </p> "
						}, {
							"dataType": "html",
							"data": " <h4>Key Factors influencing Loss from Less than 1M</h4> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> Size By Employees, Region and Group are some of the most important factors that describe the concentration of Loss from segment Less than 1M Value category. </p> "
						}, {
							"dataType": "html",
							"data": " <p class = \"txt-justify\"> <ul> <li> <b>Size By Employees</b>: Among the Size By Employees, Less than 1k has got the major chunk of Loss from segment Less than 1M, accounting for 67.0%. The percentage of Loss for Less than 1k is 70.2%. </li> </li> <li> <b>Region</b>: Some of the Region(Midwest(45.63%) and Pacific(35.8%)) account of a significant portion of Loss observations from segment Less than 1M. They cumulatively account for about 81.4% of the total Loss from segment Less than 1M. The percentage of Loss for Midwest and Pacific are 70.1% and 71.1% respectively. </li> </li> <li> <b>Group</b>: The top 2 Groups, Car Accessories(60.45%) and Performance & Non-auto(38.58%), account for 99.0% of the total Loss observations from segment Less than 1M. The percentage of Loss for Car Accessories and Performance & Non-auto are 68.3% and 78.7% respectively. </li> </li> </p> "
						}, {
							"dataType": "html",
							"data": "<div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>48.0%</span><br /><small>Overall Loss comes from Less than 1M</small></h2></div><div class='col-md-6 col-xs-12'>><h2 class='text-center'><span>77.4%</span><br /><small>1M to 10M has the highest rate of Loss</small></h2></div>"
						}],
						"name": "Size By Revenue : Distribution of Won",
						"slug": "size-by-revenue-distribution-of-won-r0rm4b8oia"
					}],
					"name": "Size By Revenue",
					"slug": "size-by-revenue-7uw7rfo9ik"
				}],
				"listOfCards": [{
					"name": "Key Influencers",
					"cardType": "normal",
					"cardData": [{
						"dataType": "html",
						"data": "<h3>Strength of association between Opportunity Result and other dimensions</h3>"
					}, {
						"dataType": "html",
						"data": "<p class=\"txt-justify\"> There are <b>14 factors</b> in the dataset and <b> all of them </b> have <b>significant association</b> with Opportunity Result. It implies that specific categories within each of the dimensions show <b>considerable amount of variation </b> in distribution of Opportunity Result categories. The chart above displays the<b> impact of key dimensions </b> on Opportunity Result, as measured by effect size. Let us take a deeper look at some of the most important relationships. </p>"
					}, {
						"dataType": "c3Chart",
						"data": {
							"chart_c3": {
								"bar": {
									"width": {
										"ratio": 0.5
									}
								},
								"point": null,
								"color": {
									"pattern": ["#0fc4b5", "#005662", "#148071", "#6cba86", "#bcf3a2"]
								},
								"tooltip": {
									"show": true
								},
								"padding": {
									"top": 40
								},
								"grid": {
									"y": {
										"show": true
									},
									"x": {
										"show": true
									}
								},
								"subchart": {
									"show": true
								},
								"axis": {
									"y": {
										"tick": {
											"outer": false,
											"format": ".2s"
										},
										"label": {
											"text": "Effect Size (Cramers-V)",
											"position": "outer-middle"
										}
									},
									"x": {
										"height": 134.8528137423857,
										"tick": {
											"rotate": -45,
											"multiline": false,
											"fit": false
										},
										"type": "category",
										"extent": [0, 10],
										"label": {
											"text": "Dimensions",
											"position": "outer-center"
										}
									}
								},
								"data": {
									"x": "key",
									"axes": {
										"value": "y"
									},
									"type": "bar",
									"columns": [
										["value", 0.4405683354532893, 0.3586384873788467, 0.3552240318168563, 0.19193323574786897, 0.1685441145709539, 0.1570572248546173, 0.12738591090314014, 0.08217588841504225, 0.06139577814933745, 0.05920513412564527, 0.05522685174722625, 0.04572070305621624, 0.04309046082824393, 0.036321636832607335],
										["key", "Elapsed Day", "Qualified Days", "Closing Days", "Revenue", "Deal Size Category", "Market Route", "Subgroup", "Group", "Competitor Type", "Sales Stage Change Count", "Amount USD", "Size By Employees", "Region", "Size By Revenue"]
									]
								},
								"legend": {
									"show": false
								},
								"size": {
									"height": 534.8528137423857
								}
							},
							"yformat": ".2f"
						}
					}],
					"slug": "key-influencers-8hmxdxrcj5",
					"cardWidth": 100
				}],
				"name": "Association",
				"slug": "association-7xbbufw1el"
			}, {
				"listOfNodes": [],
				"listOfCards": [{
					"name": "Predicting Key Drivers of Opportunity Result",
					"cardType": "normal",
					"cardData": [{
						"dataType": "html",
						"data": "<p class = \"txt-justify\"> Please select any Opportunity Result category from the drop down below to view it's most significant decision rules. These rules capture sets of observations that are most likely to be from the chosen Opportunity Result. </p>"
					}, {
						"dataType": "tree",
						"data": {
							"name": "Root",
							"children": [{
								"name": "Elapsed Day not in (Below Average,Average,Above Average,High)",
								"children": [{
									"name": "Qualified Days not in (Average,Above Average,High)",
									"children": [{
										"name": "Qualified Days not in (Below Average)",
										"children": [{
											"name": "Predict: Won"
										}]
									}]
								}]
							}]
						}
					}, {
						"dataType": "table",
						"data": {
							"tableType": "decisionTreeTable",
							"tableData": [
								["PREDICTION", "RULES", "PERCENTAGE"],
								["Won", ["Elapsed Day not in (Below Average,Average,Above Average,High),Qualified Days not in (Average,Above Average,High),Qualified Days not in (Below Average)"],
									[26.64]
								]
							]
						}
					}],
					"slug": "predicting-key-drivers-of-opportunity-result-s574lpkn9t",
					"cardWidth": 100
				}, {
					"name": "Decision Rules for Opportunity Result",
					"cardType": "normal",
					"cardData": [{
						"dataType": "html",
						"data": "<h3>Predicting the Drivers of Opportunity Result</h3> "
					}, {
						"dataType": "c3Chart",
						"data": {
							"chart_c3": {
								"bar": {
									"width": {
										"ratio": 0.5
									}
								},
								"point": null,
								"color": {
									"pattern": ["#0fc4b5", "#005662", "#148071", "#6cba86", "#bcf3a2"]
								},
								"tooltip": {
									"show": true
								},
								"padding": {
									"top": 40
								},
								"grid": {
									"y": {
										"show": true
									},
									"x": {
										"show": true
									}
								},
								"subchart": null,
								"axis": {
									"y": {
										"tick": {
											"outer": false,
											"format": ".2s"
										},
										"label": {
											"text": "",
											"position": "outer-middle"
										}
									},
									"x": {
										"height": 64.14213562373095,
										"tick": {
											"rotate": -45,
											"multiline": false,
											"fit": false
										},
										"type": "category",
										"label": {
											"text": "",
											"position": "outer-center"
										}
									}
								},
								"data": {
									"x": "key",
									"axes": {
										"value": "y"
									},
									"type": "bar",
									"columns": [
										["value", 3668, 1332],
										["key", "Loss", "Won"]
									]
								},
								"legend": {
									"show": false
								},
								"size": {
									"height": 340
								}
							},
							"yformat": ".2s"
						}
					}, {
						"dataType": "html",
						"data": " <h4>Won</h4> "
					}, {
						"dataType": "html",
						"data": " <p class = \"txt-justify\"> Key variables that characterize the segment of Won Opportunity Result includes Revenue, Qualified Days and Elapsed Day. </p> "
					}, {
						"dataType": "html",
						"data": " <p class = \"txt-justify\"> <ul> <li> When the Elapsed Day does not fall in (Below Average,Average,Above Average,High), the Qualified Days does not fall in (Below Average), the probability of Won is <b>26%</b>. </ul> </p> "
					}],
					"slug": "decision-rules-for-opportunity-result-giq3587bg9",
					"cardWidth": 100
				}],
				"name": "Prediction",
				"slug": "prediction-7uly36z716"
			}],
			"listOfCards": [{
				"cardWidth": 100,
				"cardType": "summary",
				"cardData": [{
						"dataType": "html",
						"data": "<p class=\"lead txt-justify\"> mAdvisor has analyzed the dataset, which contains<b> 15</b> variables and <b>5,000</b> observations. Please click next to find the insights from our analysis of <b>opportunity result</b>, that describes how it is distributed, what drives it, and how we can predict it. </p>"
					}],
				"name": "overall summary card",
				"slug": "overall-summary-card-138k5j9amy"
			}],
			"name": "Overview",
			"slug": "overview-f1761s6ta9"
	                }
}
@connect((store) => {
	return {login_response: store.login.login_response, 
		currentAppId:store.apps.currentAppId,
		dataPreview: store.datasets.dataPreview,
		customerDataset_slug:store.apps.customerDataset_slug,
		historialDataset_slug:store.apps.historialDataset_slug,
		externalDataset_slug:store.apps.externalDataset_slug,
		roboUploadTabId:store.apps.roboUploadTabId,
		signal: store.signals.signalAnalysis,
		roboDatasetSlug:store.apps.roboDatasetSlug,
		};
})


export class RoboDataUploadPreview extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }
  componentWillMount(){
	  this.props.dispatch(updateRoboUploadTab(1));
	  this.props.dispatch(storeSignalMeta(null,this.props.match.url));
	  this.props.dispatch(updateRoboAnalysisData(roboData,"/apps-robo"));
  }

  handleTabSelect(key){
	  this.props.dispatch(clearDataPreview());
	  this.props.dispatch(updateRoboUploadTab(key))
	  if(key == 1)
	  this.props.dispatch(getDataSetPreview(store.getState().apps.customerDataset_slug))
	  if(key == 2)
	  this.props.dispatch(getDataSetPreview(store.getState().apps.historialDataset_slug))
	  if(key == 3)
	  this.props.dispatch(getDataSetPreview(store.getState().apps.externalDataset_slug))
  }
 
  render() {
    console.log("apps is called##########3");
    return (
    		<div className="side-body">
            <div className="main-content">
            <Tabs defaultActiveKey={1} onSelect={this.handleTabSelect.bind(this)} id="controlled-tab-example" >
            <Tab eventKey={1} title="Customer Data"><RoboDUTabsContent history={this.props.history}/></Tab>
            <Tab eventKey={2} title="Historial Data"><RoboDUTabsContent history={this.props.history}/></Tab>
            <Tab eventKey={3} title="External Data"><RoboDUTabsContent history={this.props.history}/></Tab>
          </Tabs>
        </div>
        </div>
      );
  }
}
