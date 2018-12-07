import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';

export const patienOptions = [
  { key: 'Patient/1', value: 'Patient/1', text: 'Patient a' },
  { key: 'Patient/2', value: 'Patient/2', text: 'Patient b' },
  { key: 'Patient/3', value: 'Patient/3', text: 'Patient c' },

]

let blackBorder = "blackBorder";

export default class DropdownPatient extends Component {
  constructor(props){
    super(props);
    this.state = { currentValue: ""}
    this.handleChange = this.handleChange.bind(this);
  };

  handleChange = (e, { value }) => {
    console.log(this.props);
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
        options={patienOptions}
        placeholder='Choose Patient'
        search
        selection
        fluid
        onChange={this.handleChange}
      />
    )
  }
}
