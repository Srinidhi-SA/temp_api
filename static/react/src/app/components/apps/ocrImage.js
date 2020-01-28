import React from 'react';
import { Button } from "react-bootstrap";
import { saveImagePageFlag } from '../../actions/ocrActions';
import { connect } from "react-redux";
import { store } from '../../store'

@connect((store) => {
  return {
  };
})

export class OcrImage extends React.Component {

  constructor(props) {
    super(props)
  }

  handleImagePageFlag=()=>{
    this.props.dispatch(saveImagePageFlag(false));
  }

  render() {
    return (
      <div class="row">
        <div class="col-md-12">
        <Button bsStyle="primary" onClick={this.handleImagePageFlag} style={{marginBottom:20}}><i class="fa fa-close"></i> close</Button>
        </div>
      </div>
    )
  }
}