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
import {DetailOverlay} from "../common/DetailOverlay";
import {MainHeader} from "../common/MainHeader";
import {BreadCrumb} from "../common/BreadCrumb";
import {getDataList, getDataSetPreview, storeSignalMeta, handleDelete, handleRename,refreshDatasets,resetSubsetting} from "../../actions/dataActions";
import {fetchProductList, openDULoaderPopup, closeDULoaderPopup, storeSearchElement,storeSortElements,updateDatasetName} from "../../actions/dataActions";
import {open, close,triggerDataUploadAnalysis,updateHideData} from "../../actions/dataUploadActions";
import {STATIC_URL} from "../../helpers/env.js"
import {SEARCHCHARLIMIT,getUserDetailsOrRestart,SUCCESS,INPROGRESS,HANA,MYSQL,MSSQL,HDFS,FILEUPLOAD} from  "../../helpers/helper"
import {DataUploadLoader} from "../common/DataUploadLoader";
import Dialog from 'react-bootstrap-dialog'
import {clearDataPreview} from "../../actions/dataUploadActions";

var dateFormat = require('dateformat');

@connect((store) => {
    return {
        login_response: store.login.login_response,
        dataList: store.datasets.dataList,
        dataPreview: store.datasets.dataPreview,
        signalMeta: store.datasets.signalMeta,
        selectedDataSet: store.datasets.selectedDataSet,
        dataPreviewFlag: store.datasets.dataPreviewFlag,
        dataUploadLoaderModal: store.datasets.dataUploadLoaderModal,
        data_search_element: store.datasets.data_search_element,
        data_sorton:store.datasets.data_sorton,
        data_sorttype:store.datasets.data_sorttype,
        dialogBox:store.datasets.dataDialogBox,
    };
})

export class DataCard extends React.Component {
    constructor(props) {
        super(props);
    }
    
    getPreviewData(e) {
        var that = this;
        this.selectedData = e.target.id;
        //alert(this.selectedData);
        this.props.dispatch(clearDataPreview());
        this.props.dispatch(storeSignalMeta(null, that.props.match.url));
        this.props.dispatch(getDataSetPreview(this.selectedData));
        this.props.dispatch(resetSubsetting(this.selectedData));
    }
    
    handleDelete(slug,evt) {
        this.props.dispatch(handleDelete(slug, this.dialog,evt));
    }
    handleRename(slug, name) {
        this.props.dispatch(handleRename(slug, this.dialog, name));
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

        const dataSetList = dataSets.map((data, i) => { 
            var iconDetails = "";
            var dataSetLink = "/data/" + data.slug;
            var percentageDetails = "";
            
            var dataClick = <Link to={dataSetLink} id={data.slug} onClick={this.getPreviewData.bind(this)}>
            {data.name}
            </Link>
            if(data.status == INPROGRESS){
                percentageDetails =   <div class=""><i className="fa fa-circle inProgressIcon"></i><span class="inProgressIconText">{data.completed_percentage >= 0 ? data.completed_percentage+' %':"In Progress"}</span></div>
                dataClick = <a class="cursor" onClick={this.openDataLoaderScreen.bind(this,data.slug,data.completed_percentage,data.completed_message)}> {data.name}</a>
            }else if(data.status == SUCCESS && !data.viewed){
                data.completed_percentage = 100;
                percentageDetails =   <div class=""><i className="fa fa-check completedIcon"></i><span class="inProgressIconText">{data.completed_percentage}&nbsp;%</span></div>
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
                    
                    
                    
                    {/*<!-- Rename and Delete BLock  -->*/}
                    {isDropDown == true ?<div class="btn-toolbar pull-right"><a className="dropdown-toggle more_button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
                            <i className="ci zmdi zmdi-hc-lg zmdi-more-vert"></i>
                            </a>
                            <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                           {permissionDetails.rename_dataset == true ?  <li onClick={this.handleRename.bind(this, data.slug, data.name)}>
                                   <a className="dropdown-item" href="#renameCard" data-toggle="modal">
                                   <i className="fa fa-edit"></i>&nbsp;&nbsp;Rename</a>
                                   </li>:""}
                           
                            
                            {permissionDetails.remove_dataset == true ? <li onClick={this.handleDelete.bind(this, data.slug)}>
                                    <a className="dropdown-item" href="#deleteCard" data-toggle="modal">
                                    <i className="fa fa-trash-o"></i>&nbsp;&nbsp;{data.status == "INPROGRESS"
                                        ? "Stop and Delete "
                                                : "Delete"}</a>
                                                </li>: ""}
                                        </ul></div>:<div class="btn-toolbar pull-right"></div>} 

                                
                                <div className="clearfix"></div>
                                {percentageDetails}
                                
                                <OverlayTrigger trigger="click" rootClose placement="left" overlay={< Popover id = "popover-trigger-focus" > <DetailOverlay details={data}/> </Popover>}>
                                <a  className="pover cursor">
                                <div class="card_icon">
                                {iconDetails}
                                </div>
                                </a>
                                </OverlayTrigger>
                                
                                </div>
                                
                                </div>
                                </div>
                                <div className="card-footer">
                                <div className="left_div">
                                <span className="footerTitle"></span>{getUserDetailsOrRestart.get().userName}
                                <span className="footerTitle">{dateFormat(data.created_at, "mmm d,yyyy HH:MM")}</span>
                                </div>
                                
                                
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
