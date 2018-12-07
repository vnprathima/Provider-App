import React, {Component} from 'react';

export default class CoverageDetermination extends Component {
  constructor(props){
    super(props);
    this.state = {
      errors: {},
    }
  }
  renderClaimSubmit() {
      return (
        <React.Fragment>
            <div>In Coverage determination form submit..</div>
        </React.Fragment>);
    };

  render() {
    return (
      <div className="attributes mdl-grid">
          {this.renderClaimSubmit()}
      </div>)
  }
}