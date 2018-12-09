import React, {Component} from 'react';

export default class Review extends Component {
  constructor(props){
    super(props);
    this.state = {
      errors: {},
    }
  }
  renderClaimSubmit() {
      return (
        <React.Fragment>
            <div>In Pre/Post Payment Review form submit..</div>
        </React.Fragment>);
    };

  render() {
    return (
      <div className="attributes mdl-grid">
          {this.renderClaimSubmit()}
      </div>)
  }
}