import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';

export const options = [
  { key: 'Coverage/5', value: 'Coverage/5', text: 'Coverage 5',resource_json:{
    resourceType: "Coverage",
    id: "5",
    class: [
      {
        type: {
          system: "http://hl7.org/fhir/coverage-class",
          code: "plan"
        },
        value: "Medicare Part D"
      }
    ],
    payor: [
      {
        reference: "Organization/6"
      }
    ]
    }
  },
  { key: 'Coverage/2', value: 'Coverage/2', text: 'Coverage b',resource_json:{} },
  { key: 'Coverage/3', value: 'Coverage/3', text: 'Coverage c',resource_json:{} },

]

let blackBorder = "blackBorder";

export default class DropdownCoverage extends Component {
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
        placeholder='Choose Coverage'
        search
        selection
        fluid
        onChange={this.handleChange}
      />
    )
  }
}
