import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';

export const requestOptions = [
  { key: 'coverage-requirement', value: 'coverage-requirement', text: 'Coverage Requirement' },
  { key: 'decision', value: 'decision', text: 'Claim Decision' },
  { key: 'prior-authorization', value: 'prior-authorization', text: 'Prior Authorization' },
]

let blackBorder = "blackBorder";

export default class DropdownState extends Component {
  constructor(props){
    super(props);
    this.state = { currentValue: ""}
  };

  handleChange = (e, { value }) => {
    this.props.updateCB(this.props.elementName, value)
    this.setState({ currentValue: value })
  }

  render() {
    const { currentValue } = this.state
    if(currentValue){
        blackBorder = "blackBorder";
    }else{
        blackBorder = "";
    }
    return (
      <Dropdown
      className={blackBorder}
        options={requestOptions}
        placeholder='Request Type'
        search
        selection
        fluid
        onChange={this.handleChange}
      />
    )
  }
}