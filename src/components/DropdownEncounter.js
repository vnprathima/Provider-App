import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';
import { login } from './Authentication';

// this.myclient = new FhirClient(this.URL);
export const encounterOptions = [];

let blackBorder = "blackBorder";

export default class DropdownEncounter extends Component {
  constructor(props){
    super(props);
    this.state = { currentValue: ""}
    this.handleChange = this.handleChange.bind(this);
    
    };
    componentDidMount() {
      this.getEncounterDetails();
    }
  async getEncounterDetails(){
    let token = await login();
    var mkFhir = require('fhir.js');
    var client = mkFhir({
      baseUrl: 'http://54.227.173.76:8181/fhir/baseDstu3',
      auth: {
        bearer: token,
      }
    });
    client
      .search( {type: 'Encounter', query: {  }})
      .then(function(res){
          var bundle = res.data;
          for(var i=0;i<bundle.entry.length;i++){
            console.log(bundle.entry[i].resource.id)
            encounterOptions.push({
              key: bundle.entry[i].resource.id,
              value: bundle.entry[i].resource.id,
              text: bundle.entry[i].resource.reason[0].text,
            })
          }

      })  
  }
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
        options={encounterOptions}
        placeholder='Choose Encounter'
        search
        selection
        fluid
        onChange={this.handleChange}
      />
    )
  }
}
