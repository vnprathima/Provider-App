import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';
import rxnorm from '../medication-list'


let allMedicationOptions=[];
function medicationMap(object) {
    console.log('i medications')
    for(const key in object){
        allMedicationOptions.push({'key':key,'value':key,'text':object[key]})
    }
    return allMedicationOptions;
   }
export const medicationOptions = medicationMap(rxnorm.cuiToName)


let blackBorder = "blackBorder";

export default class DropdownMedicationList extends Component {
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
        options={medicationOptions}
        placeholder='Diagnosis or Nature of illness or Injury'
        search
        selection
        fluid
        onChange={this.handleChange}
      />
    )
  }
}
