import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';
//import {createToken} from './Authentication';
import {createJwt} from './AuthenticationJwt';
import config from '../properties.json';
// import { createJwt } from './jwt'



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
    //with Jwt
     let jwt = await createJwt();
     jwt = "Bearer " + jwt;
     //with token
    //  let token = await createToken();
     var myHeaders = new Headers({
      //  "Content-Type": "application/json",
       "authorization": jwt,
       "Allow-Control-Allow-Origin":"*",
        "cache-control": "no-cache"
     });
    //  GET call to FHir server http://54.227.173.76:8181/fhir/baseDstu3/Patient
           console.log("Fetching response from ",config.fhir_url)
         try{
           const fhirResponse= await fetch("http://localhost:8080/hapi-fhir-jpaserver-example/fhir/baseDstu3/Patient",{
               method: "GET",
               headers: myHeaders,
              //  body: JSON.stringify(json_request)
           }).then(response => {
            console.log("Recieved response",);
              return response.json();
          }).catch(reason => console.log("No response recieved from the server",reason ));

          if(fhirResponse && fhirResponse.status){
            console.log(fhirResponse);
            console.log("Server returned status "
                            + fhirResponse.status + ": "
                            + fhirResponse.error,);
            console.log(fhirResponse.message,);
          }else{
            // this.setState({response: fhirResponse});
          }
          console.log('-=-=-=-=-=-==-',fhirResponse)
        }catch(error){
          // this.setState({loading:false});
          console.log("Unexpected error occured",)
          // console.log(e.,types.error);
          if(error instanceof TypeError){
            console.log(error.name + ": " + error.message,);
          }
        }



     
    // using Post Call to fhir server 
    //  var mkFhir = require('fhir.js');
    //  var client = mkFhir({
    //   // baseUrl: 'http://54.227.173.76:8181/fhir/baseDstu3',
    //   baseUrl: 'http://localhost:8080/hapi-fhir-jpaserver-example',
    //   // baseUrl:config.fhir_url,

    //   authorization: {
    //     bearer: jwt,
    //   }
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
