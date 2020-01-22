import React from "react";
import {connect} from "react-redux";

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

render() {
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
