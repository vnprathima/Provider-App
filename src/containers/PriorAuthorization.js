import React, {Component} from 'react';

export default class PriorAuthorization extends Component {
  constructor(props){
    super(props);
    this.state = {
      errors: {},
    }
  }
  renderClaimSubmit() {
      return (
        <React.Fragment>
            <div>In Prior Authorization  form submit..</div>
        </React.Fragment>);
    };

  render() {
    return (
      <div className="attributes mdl-grid">
          {this.renderClaimSubmit()}
      </div>)
  }
}