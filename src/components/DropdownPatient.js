import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';
import {login} from './Authentication';
import config from '../properties.json';
// import { createJwt } from './jwt'


// this.myclient = new FhirClient(this.URL);
export const patientOptions = [
  {key:1,value: 1,text: "Peter James"},
  {key:2,value: 2,text: "Aloha Raeem"},
  {key:3,value: 3,text: "Peter James"},
  {key:4,value: 4,text: "Richard Jeff"},
  {key:5,value: 5,text: "Steven Edward"},
  {key:6,value: 6,text: "Kevin Jason"},
  {key:7,value: 7,text: "James William"},
  {key:8,value: 8,text: "Barbara Faith"},
  {key:9,value: 9,text: "Gabrielle Daisy"},
];
// export const patientOptions = [];

let blackBorder = "blackBorder";

export default class DropdownPatient extends Component {
  constructor(props){
    super(props);
    this.state = { currentValue: ""}
    this.handleChange = this.handleChange.bind(this);
    };
    // var k = status();
    componentDidMount() {
      this.getPatientDetails();
    }
   async getPatientDetails(){
     let token = await login();
    //  console.log(token,'pleaseee')
    //  var mkFhir = require('fhir.js');
    //  var client = mkFhir({
    //   // baseUrl: 'http://54.227.173.76:8181/fhir/baseDstu3',
    //   baseUrl: 'http://localhost:8080/hapi-fhir-jpaserver-example/baseDstu3',

    //   // auth: {
    //   //   bearer: token,
    //   // }
    // });
    // client
    //   .search( {type: 'Patient', query: {  }})
    //   .then(function(res){
    //       var bundle = res.data;
    //       for(var i=0;i<bundle.entry.length;i++){
    //         console.log(bundle.entry[i].resource.name[0].given[0])
    //         if(bundle.entry[i].resource.name[0].given[1]!= undefined){
    //           var name = bundle.entry[i].resource.name[0].given[0]+" "+bundle.entry[i].resource.name[0].given[1]
    //         }
    //         else{
    //           var name = bundle.entry[i].resource.name[0].given[0]+" "+bundle.entry[i].resource.name[0].family
    //         }
    //         patientOptions.push({
    //           key: bundle.entry[i].resource.id,
    //           value: bundle.entry[i].resource.id,
    //           text: name,
    //         })
    //       }

    //   })  
   }



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
