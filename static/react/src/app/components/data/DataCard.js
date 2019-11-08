import React from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {push} from "react-router-redux";
import $ from "jquery";
import {
    Pagination,
    Tooltip,
    OverlayTrigger,
    Popover,
    Modal,
    Button
} from "react-bootstrap";
import store from "../../store";
import {Share} from "../common/Share"
import {DetailOverlay} from "../common/DetailOverlay";
import {MainHeader} from "../common/MainHeader";
import {BreadCrumb} from "../common/BreadCrumb";
import {getDataList, getDataSetPreview, storeSignalMeta, handleDelete, handleRename,handleShare,refreshDatasets,resetSubsetting,getAllDataList,getAllUsersList} from "../../actions/dataActions";
import {fetchProductList, openDULoaderPopup, closeDULoaderPopup, storeSearchElement,storeSortElements,updateDatasetName,openShareModalAction,closeShareModalAction} from "../../actions/dataActions";
import {open, close,triggerDataUploadAnalysis,updateHideData} from "../../actions/dataUploadActions";
import {STATIC_URL} from "../../helpers/env.js"
import {SEARCHCHARLIMIT,getUserDetailsOrRestart,SUCCESS,INPROGRESS,HANA,MYSQL,MSSQL,HDFS,FILEUPLOAD, FAILED, statusMessages} from  "../../helpers/helper"
import {DataUploadLoader} from "../common/DataUploadLoader";
import Dialog from 'react-bootstrap-dialog'
import {clearDataPreview} from "../../actions/dataUploadActions";

var dateFormat = require('dateformat');

@connect((store) => {
    return {
        login_response: store.login.login_response,
        dataList: store.datasets.dataList,
        shareModelShow:store.datasets.shareModelShow,
        userList:store.datasets.allUserList,
        dataPreview: store.datasets.dataPreview,
        signalMeta: store.datasets.signalMeta,
        selectedDataSet: store.datasets.selectedDataSet,
        dataPreviewFlag: store.datasets.dataPreviewFlag,
        dataUploadLoaderModal: store.datasets.dataUploadLoaderModal,
        data_search_element: store.datasets.data_search_element,
        data_sorton:store.datasets.data_sorton,
        data_sorttype:store.datasets.data_sorttype,
        dialogBox:store.datasets.dataDialogBox,
        allDataList:store.datasets.allDataSets,

    };
})

export class DataCard extends React.Component {
    constructor(props) {
        super(props);
    }
    componentWillMount() {
        this.props.dispatch(getAllDataList());
        this.props.dispatch(getAllUsersList())
      }
    
    getPreviewData(status,e) {
        if(status==FAILED){
            bootbox.alert(statusMessages("error","The uploaded file does not contain data in readable format. Please check the source file and try uploading again.","small_mascot"));            
        }else{
            var that = this;
            this.selectedData = e.target.id;
            //alert(this.selectedData);
            this.props.dispatch(clearDataPreview());
            this.props.dispatch(storeSignalMeta(null, that.props.match.url));
            this.props.dispatch(getDataSetPreview(this.selectedData));
            this.props.dispatch(resetSubsetting(this.selectedData));
        }
    }
    
    handleDelete(slug,evt) {
        this.props.dispatch(handleDelete(slug, this.dialog,evt));
    }
    handleRename(slug, name,dataList) {
        // console.log(this.props.allDataList)
        var allDataList=this.props.allDataList
        this.props.dispatch(handleRename(slug, this.dialog, name,allDataList,dataList));
    }
    openShareModal(shareItem,slug) {
        console.log("open ---openBinsOrLevelsModal");
        this.props.dispatch(openShareModalAction(shareItem,slug));
        //this.setState({NoModal: this.state.NoModal + 1});
       }
    closeShareModal(event) {
        console.log("closeddddd ---closeBinsOrLevelsModal");
        this.props.dispatch(closeShareModalAction());
      }
    openDataLoaderScreen(slug, percentage, message, e){
        var dataUpload = {};
        dataUpload.slug = slug
        this.props.dispatch(openDULoaderPopup());
        this.props.dispatch(updateDatasetName(slug));
        this.props.dispatch(updateHideData(true));
        this.props.dispatch(triggerDataUploadAnalysis(dataUpload, percentage, message));
    }
    
    render() { 
        const dataSets = this.props.data;
        const dataList=this.props.dataList;

        const dataSetList = dataSets.map((data, i) => { 
            var iconDetails = "";
            if(data.status == FAILED){
            var dataSetLink = "/data/";
            }else{
            var dataSetLink = "/data/" + data.slug;
            }
            var percentageDetails = "";
            
            var dataClick = <Link to={dataSetLink} id={data.slug} onClick={this.getPreviewData.bind(this,data.status)}>
            {data.name}
            </Link>
            if(data.status == INPROGRESS){
                percentageDetails =   <div class=""><i className="fa fa-circle inProgressIcon"></i><span class="inProgressIconText">{data.completed_percentage >= 0 ? data.completed_percentage+' %':"In Progress"}</span></div>
                dataClick = <a class="cursor" onClick={this.openDataLoaderScreen.bind(this,data.slug,data.completed_percentage,data.completed_message)}> {data.name}</a>
            }else if(data.status == SUCCESS){
                data.completed_percentage = 100;
                percentageDetails =   <div class=""><i className="fa fa-check completedIcon"></i><span class="inProgressIconText">{data.completed_percentage}&nbsp;%</span></div>
            }else if(data.status == FAILED){
                percentageDetails =  <div class=""><font color="#ff6600">Failed</font></div>
            }
            
            
            let src = STATIC_URL + "assets/images/File_Icon.png"
            if(data.datasource_type == HANA){
                src = STATIC_URL + "assets/images/sapHana_Icon.png"
            }else if (data.datasource_type == MYSQL) {
                src = STATIC_URL + "assets/images/mySQL_Icon.png"
            }else if (data.datasource_type == MSSQL) {
                src = STATIC_URL + "assets/images/SqlServer_Icons.png"
            }else if (data.datasource_type == HDFS) {
                src = STATIC_URL + "assets/images/hadoop_Icons.png"
            }else {
                src = STATIC_URL + "assets/images/File_Icon.png"
            }
            iconDetails = <img src={src} alt="LOADING"/>;
            var permissionDetails = data.permission_details;
            var isDropDown = permissionDetails.remove_dataset || permissionDetails.rename_dataset;

           
            
            
            return (
                    <div className="col-md-3 xs-mb-15 list-boxes" key={i}>
                    <div className="rep_block newCardStyle" name={data.name}>
                    <div className="card-header"></div>
                    <div className="card-center-tile">
                    <div className="row">
                    <div className="col-xs-12">
                    <h5 className="title newCardTitle pull-left">
                    {dataClick}
                    </h5>
                    <div className="pull-right">{iconDetails}</div>
                    <div className="clearfix"></div>
                    
					<div className="clearfix"></div>
                                {percentageDetails}
                                
                             {/*   <OverlayTrigger trigger="click" rootClose placement="left" overlay={< Popover id = "popover-trigger-focus" > <DetailOverlay details={data}/> </Popover>}>
                                <a  className="pover cursor">
                                <div class="card_icon">
                                {iconDetails}
                                </div>
                                </a>
                                </OverlayTrigger> */}
                                
                                </div>
                                
                                </div>
                                </div>
                                <div className="card-footer">
                                <div className="left_div">
                                <span className="footerTitle"></span>{getUserDetailsOrRestart.get().userName}
                                <span className="footerTitle">{dateFormat(data.created_at, "mmm d,yyyy HH:MM")}</span>
                                </div>
								
                                {/*<!-- Rename and Delete BLock  -->*/}
                    {isDropDown == true ?<div class="btn-toolbar pull-right"><a className="dropdown-toggle more_button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
                            <i className="ci zmdi zmdi-hc-lg zmdi-more-vert"></i>
                            </a>
                            <ul className="dropdown-menu dropdown-menu-right drp_cst_width" aria-labelledby="dropdownMenuButton">
							<li className="xs-pl-20 xs-pr-20 xs-pt-10 xs-pb-10"><DetailOverlay details={data}/> </li>
							<li className="xs-pl-20 xs-pr-20 xs-pb-10">
								{permissionDetails.rename_dataset == true ?  <span onClick={this.handleRename.bind(this, data.slug, data.name,dataList.data)}>
								<a className="dropdown-item btn-primary" href="#renameCard" data-toggle="modal">
								<i className="fa fa-edit"></i>&nbsp;&nbsp;Rename</a>
								</span>:""}


								{permissionDetails.remove_dataset == true ? <span onClick={this.handleDelete.bind(this, data.slug)}>
								<a className="dropdown-item btn-primary" href="#deleteCard" data-toggle="modal">
								<i className="fa fa-trash-o"></i>&nbsp;&nbsp;{data.status == "INPROGRESS"
								? "Stop"
								: "Delete"}</a>
                                </span>: ""}
                                {data.status == "SUCCESS"? <span onClick={this.openShareModal.bind(this,data.name,data.slug)}>
								<a className="dropdown-item btn-primary" href="#shareCard" data-toggle="modal">
								<i className="fa fa-share-alt"></i>&nbsp;&nbsp;{"Share"}</a>
								</span>: ""}
                                <Share usersList={this.props.userList}/>
                                <div className="clearfix"></div>
							</li>
							</ul></div>:<div class="btn-toolbar pull-right"></div>}
                                
                                {/*popover*/}
                                
                                </div>
                                </div>
                                  <Dialog ref={(el) => { this.dialog = el }}/>
                                </div>
            )
        });
        return(<div >
        {
            (dataSetList.length>0)
            ?(dataSetList)
                    :(<div><div className="text-center text-muted xs-mt-50"><h2>No results found..</h2></div></div>)
        }

        </div>);
        
    }
    
    
}
