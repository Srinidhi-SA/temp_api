import React from "react";
import {connect} from "react-redux";
import { Button} from "react-bootstrap";
import {getUserDetailsOrRestart} from "../../helpers/helper"
@connect((store) => {
  return {
    OcrfileUpload: store.ocr.OcrfileUpload,

  };
})

export class OcrUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFiles: ""
    }
  }

  onChangeHandler=event=>{
    console.log(event.target.files);
    this.setState({
      selectedFiles: Object.values(event.target.files),
     })
  }

  removeFile(item){
  this.setState({
    selectedFiles: Object.values(this.state.selectedFiles).filter(i=>i.name!=item),
   })
  }

  getHeader = token => {
    return {
      Authorization: token
    };
  };

  handleSubmit(acceptedFiles ){
    var data = new FormData();
    console.log(this.state.selectedFiles);
    for (var x = 0; x < acceptedFiles.length; x++) {
      data.append("file", acceptedFiles[x]);
    }
    return fetch("https://madvisor-dev.marlabsai.com/ocr/ocrimage/", {
      method: "POST",
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: data
    });
  };


  render(){
    var fileNames= this.state.selectedFiles!=""?Object.values(this.state.selectedFiles).map(i=>i.name).map((item,index)=>(
      <ul className="list-unstyled bullets_primary">
        <li>{item}
        <span style={{marginLeft:"10px"}}onClick={this.removeFile.bind(this,item)}>
        <i class="fa fa-times" aria-hidden="true"></i>
        </span>
        </li>
      </ul>
    ))
    :""

    var content =(
                <div>
                  File Upload
                  <input type="file" multiple onChange={this.onChangeHandler}/>
                  <div className=" ">
                    {/* <Dropzone id={1} onDrop={this.onChangeHandler}  multiple>
                      <p>Please drag and drop your file here or browse.</p>
                    </Dropzone> */}
                    <aside>
                      {fileNames}
                    </aside>
                    <Button bsStyle="primary" onClick={this.handleSubmit.bind(this,this.state.selectedFiles)}> Upload</Button>
                  </div>
                 </div>
    )
   return (
        <div>
        {content}
        </div>
   )
 }

}
