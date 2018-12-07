import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';

export const options = [
  { key: 'Practitioner/example', value: 'Practitioner/1', text: 'Practitioner a' },
  { key: 'Practitioner/2', value: 'Practitioner/2', text: 'Practitioner b' },
  { key: 'Practitioner/3', value: 'Practitioner/3', text: 'Practitioner c' },

]

let blackBorder = "blackBorder";

export default class DropdownPractitioner extends Component {
  constructor(props){
    super(props);
    this.state = { currentValue: ""};
    this.handleChange = this.handleChange.bind(this);
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
        options={options}
        placeholder='Choose Practitioner'
        search
        selection
        fluid
        onChange={this.handleChange}
      />
    )
  }
}
