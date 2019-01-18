import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';

export const payerOptions = [
  { key: 'medicare-fee-for-service', value: 'medicare-fee-for-service', text: 'Medicare Fee for service' },
  { key: 'humana', value: 'humana', text: ' Humana' },
  { key: 'cigna', value: 'cigna', text: 'Cigna' },
]

let blackBorder = "blackBorder";

export default class DropdownPayer extends Component {
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
        options={payerOptions}
        placeholder='Payer'
        value={'medicare-fee-for-service'}
        search
        selection
        fluid
        
        onChange={this.handleChange}
      />
    )
  }
}
