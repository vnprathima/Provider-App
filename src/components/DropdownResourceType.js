import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';

export const options = [
  { key: 'DeviceRequest', value: 'DeviceRequest', text: 'Device Request' },
  { key: 'ResourceType/2', value: 'ResourceType/2', text: 'ResourceType b' },
  { key: 'ResourceType/3', value: 'ResourceType/3', text: 'ResourceType c' },

]

let blackBorder = "blackBorder";

export default class DropdownResourceType extends Component {
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
        placeholder='Choose ResourceType'
        search
        selection
        fluid
        onChange={this.handleChange}
      />
    )
  }
}
