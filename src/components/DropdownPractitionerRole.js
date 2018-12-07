import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';

export const options = [
  { key: 'PractitionerRole/10', value: 'PractitionerRole/10', text: 'PractitionerRole 10' },
  { key: 'PractitionerRole/2', value: 'PractitionerRole/2', text: 'PractitionerRole b' },
  { key: 'PractitionerRole/3', value: 'PractitionerRole/3', text: 'PractitionerRole c' },

]

let blackBorder = "blackBorder";

export default class DropdownPractitionerRole extends Component {
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
        options={options}
        placeholder='Choose PractitionerRole'
        search
        selection
        fluid
        onChange={this.handleChange}
      />
    )
  }
}
