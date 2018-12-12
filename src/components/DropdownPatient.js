import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';

// this.myclient = new FhirClient(this.URL);
export const patientOptions = [];

let blackBorder = "blackBorder";

export default class DropdownPatient extends Component {
  constructor(props){
    super(props);
    this.state = { currentValue: ""}
    this.handleChange = this.handleChange.bind(this);
    var mkFhir = require('fhir.js');
    var client = mkFhir({
      baseUrl: 'http://localhost:8080/hapi-fhir-jpaserver-example/baseDstu3'
    });
    client
      .search( {type: 'Patient', query: {  }})
      .then(function(res){
          var bundle = res.data;
          var count = (bundle.entry && bundle.entry.length) || 0;
          console.log("# Patients born in 1974: ", count,bundle.entry);
          for(var i=0;i<bundle.entry.length;i++){
            console.log(bundle.entry[i].resource.name[0].given[0])
            if(bundle.entry[i].resource.name[0].given[1]!= undefined){
              var name = bundle.entry[i].resource.name[0].given[0]+" "+bundle.entry[i].resource.name[0].given[1]
            }
            else{
              var name = bundle.entry[i].resource.name[0].given[0]+" "+bundle.entry[i].resource.name[0].family
            }
            patientOptions.push({
              key: bundle.entry[i].resource.id,
              value: bundle.entry[i].resource.id,
              text: name,
            })
          }
          console.log('yooo',patientOptions);

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
        options={patientOptions}
        placeholder='Choose Patient'
        search
        selection
        fluid
        onChange={this.handleChange}
      />
    )
  }
}
