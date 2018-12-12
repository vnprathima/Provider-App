import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';

// this.myclient = new FhirClient(this.URL);
export const encounterOptions = [];

let blackBorder = "blackBorder";

export default class DropdownEncounter extends Component {
  constructor(props){
    super(props);
    this.state = { currentValue: ""}
    this.handleChange = this.handleChange.bind(this);
    var mkFhir = require('fhir.js');
    var client = mkFhir({
      baseUrl: 'http://localhost:8080/hapi-fhir-jpaserver-example/baseDstu3'
    });
    client
      .search( {type: 'Encounter', query: {  }})
      .then(function(res){
          var bundle = res.data;
          var count = (bundle.entry && bundle.entry.length) || 0;
          console.log("# Patieassdsnts born in 1974: ", count,bundle.entry);
          for(var i=0;i<bundle.entry.length;i++){
            console.log(bundle.entry[i].resource.id)
            encounterOptions.push({
              key: bundle.entry[i].resource.id,
              value: bundle.entry[i].resource.id,
              text: bundle.entry[i].resource.reason[0].text,
            })
          }
          console.log('yooo',encounterOptions);

      })  
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
