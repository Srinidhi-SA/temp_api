import React from "react";
import { connect } from "react-redux";
import { MultiSelect } from 'primereact/multiselect';
import { Tab, Row, Col } from "react-bootstrap";

@connect((store) => {
  return {
    shareItem: store.datasets.shareItem,
  };
})

export class Share extends React.Component {
  constructor(props) {
    super(props);
    this.state={
			names:[]
		}
  }
  componentWillMount() {
  }
  
  getMultiSelectOptions() {
  var UserNames=Object.values(this.props.usersList.allUsersList).map(i=>i)
    return UserNames.map(function (item) {
      return { "label": item.name, "value": item.Uid };
    });
  }

  render() {
   var bins =
      (
        <Tab.Pane>
       {this.props.shareItem}
       <div className="form-group">
       <div className="content-section implementation multiselect-demo">
       <MultiSelect  value={this.state.names}  options={this.getMultiSelectOptions()} onChange={(e) => this.setState({names: e.value})}
        style={{ minWidth: '20em' }}  filter={true} placeholder="choose" />
       </div>
       </div>
        </Tab.Pane>)

    return (
      <div>
        <Tab.Container id="left-tabs-example">
          <Row className="clearfix">
            <Col sm={15}>
              <Tab.Content animation>
                {bins}
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    );
  }
}