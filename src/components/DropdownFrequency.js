import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';

export const frequencyOptions = [
  { key: 'daily', value: 'daily', text: 'Daily' },
  { key: 'twice-daily', value: 'twice-daily', text: ' Twice Daily' },
  { key: 'three-times-daily', value: 'three-times-daily', text: 'Three Times Daily' },
  { key: 'four-times-daily', value: 'four-times-daily', text: 'Four Times Daily' },
]

let blackBorder = "blackBorder";

export default class DropdownFrequency extends Component {
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
        options={frequencyOptions}
        placeholder='Frequency'
        search
        selection
        
        onChange={this.handleChange}
      />
    )
  }
}
