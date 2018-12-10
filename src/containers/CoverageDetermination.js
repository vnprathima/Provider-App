import React, {Component} from 'react';

import InputBox from '../components/InputBox';

import DropdownPatient from '../components/DropdownPatient';
import DropdownPractitioner from '../components/DropdownPractitioner';

import DropdownResourceType from '../components/DropdownResourceType';


export default class CoverageDetermination extends Component {
  constructor(props){
    super(props);
    this.state = {
        patient:null,
        resourceType:null,
        encounterId:null,


      errors: {},
    }
    this.validateMap={
      // age:(foo=>{return isNaN(foo)}),
      encounterId:(foo=>{return isNaN(foo)}),
      // gender:(foo=>{return foo!=="male" && foo!=="female"}),
      status:(foo=>{return foo!=="draft" && foo!=="open"}),
      code:(foo=>{return !foo.match(/^[a-z0-9]+$/i)})
  };
  this.updateStateElement = this.updateStateElement.bind(this);
  }
  validateState(){
    const validationResult = {};
    Object.keys(this.validateMap).forEach(key => {
        if(this.state[key] && this.validateMap[key](this.state[key])){
            // Basically we want to know if we have any errors
            // or empty fields, and we want the errors to override
            // the empty fields, so we make errors 0 and unpopulated
            // fields 2.  Then we just look at whether the product of all
            // the validations is 0 (error), 1 (valid) , or >1 (some unpopulated fields).
            validationResult[key]=0;
        }else if(this.state[key]){
            // the field is populated and valid
            validationResult[key]=1;
        }else{
            // the field is not populated
            validationResult[key]=2
        }
    });

    return validationResult;
}
updateStateElement = (elementName, text) => {
  this.setState({ [elementName]: text});
}
  renderClaimSubmit() {
    const status_opts = {
      option1:{
        text:"Draft",
        value:"draft"
      },
      option2:{
        text:"Open",
        value:"open"
      }
    }
    const validationResult = this.validateState();
    const result = {
      "hookInstance": "d1577c69-dfbe-44ad-ba6d-3e05e953b2ea",
      "fhirServer": "http://in.affosoft.com:8080/hapi-fhir-jpaserver-example/baseDstu3/MedicationRequest",
      "hook": "order-review",
      "user": "Practitioner/example",
      "context": {
          "patientId": "19953",
          "encounterId": "19955",
          "orders": {
              "resourceType": "Bundle",
              "entry": [
                  { "resource": {
                          "resourceType": "DeviceRequest",
                          "id": "24955",
                          "text": {
                              "status": "generated",
                              "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">\n\n<p>\n\n<b>Device Request</b>: Requesting oxygen device\n      </p>\n\n    </div>"
                          },
                          "identifier":[
                              {
                                  "use": "usual",
                                  "type": {
                                      "text": "Computer-Stored Abulatory Records (COSTAR)"
                                  },
                                  "system": "urn:oid:2.16.840.1.113883.6.117",
                                  "value": "999999999",
                                  "assigner": {
                                      "display": "Boston Massachesetts General Hospital"
                                  }
                              }
                          ],
                          "status":"draft",
                          "Intent":"order",
                          "priority":"urgent",
                          "code": [{
                              "coding": [
                                  {
                                  "system": "http://snomed.info/sct",
                                  "code": "20408008",
                                  "display": "Oxygen Tent"
                                  }
                              ]},
                              {
                                  "reference": "Device/14952",
                                  "display": "Oxygen Tent"
                              }
                          ],
                          "parameter":{
  
                          },
                          "requester": {
                              "reference": "Practitioner/19952",
                              "display": "Good Health"
                          }
                      }
                  }
              ]
          }
      }
  }

      return (
        <React.Fragment>
            {/* <div>In Coverage determination form submit..</div> */}
            <div>
            <div className="form-group container left-form">
              <div className="header">
                          CDS Hook
              </div>
              {/* <ul>
                <li className="order-review">Order Review</li>
                <li className="order-review">Order Review</li>
                <li className="order-review">Order Review</li>
                
              </ul> */}
              {/* <Select
                value={selectedOption}
                onChange={this.handleChange}
                options={options}
              /> */}
              {/* value={this.state.value} onChange={this.handleChange} */}
              <select style={{width:"500px"}}>
                <option selected value="order-review">Order Review</option>
                <option value="medication-prescribe">Medication Prescribe</option>
              </select>
              <div>
              <div>
                <div className="header">
                        Patient
                </div>
                <DropdownPatient
                  elementName="patient"
                  updateCB={this.updateStateElement}
                />
                <div>'hello</div>
              </div>
              <div>
                <div className="header">
                        Resource Type
                </div>
                <DropdownResourceType
                  elementName="resourceType"
                  updateCB={this.updateStateElement}
                />
              </div>

            </div>
            <div>
              {Object.keys(this.validateMap)
                  .map((key) => {

                    // Make type of input and the associated options available in some
                    // top level json instead of hard-coding the if-else per key
                    // e.g., gender should have a "toggle" attribute and the options
                    // it wants should be written in the JSON.  This way if we want more
                    // options later they're easy to add.
                  if(key==="encounterId"){
                      return <div key={key}>
                      <div className="header">
                        Encounter #
                      </div>
                      <InputBox
                          elementName={key}
                          updateCB={this.updateStateElement}
                          extraClass={!validationResult[key] ? "error-border" : "regular-border"}/>
                        <br />
                        </div>
                    }
                  })}
            </div>
          </div>
        </div>
        </React.Fragment>);
    };
    getJson(){
      const birthYear = 2018-parseInt(this.state.age,10);
      var patientId =  null;
      var practitionerId = null;
      var coverageId = null ;
      
      if(this.state.patient != null){
         patientId = this.state.patient.replace("Patient/","");
      }
      else{
        this.consoleLog("No© client id provided in properties.json",this.warning);
      }

      let request = {
        hookInstance: "d1577c69-dfbe-44ad-ba6d-3e05e953b2ea",
        // fhirServer: "http://localhost:8080/ehr-server/r4/",
        // fhirServer: "http://localhost:8080/hapi01/baseDstu3/",
        fhirServer: "http://localhost:8080/hapi-fhir-jpaserver-example/baseDstu3",        
        hook: "order-review",
        // fhirAuthorization : {
        //   "access_token" : this.state.token,
        //   "token_type" : config.token_type, // json
        //   "expires_in" : config.expires_in, // json
        //   "scope" : "patient/Patient.read patient/Observation.read",
        //   "subject" : "cds-service4"
        // },
        // user: this.state.practitioner, // select
        context: {
          patientId: patientId ,  // select
          encounterId: this.state.encounterId, // select
          orders: {
            resourceType: "Bundle",
            entry: [
              {
                resource: {
                  resourceType: this.state.resourceType,  // select
                  id: "4952",
                }
              }
            ]
          }
        }
      };
      return request;
    }
  render() {
    return (
      <div className="attributes mdl-grid">
          {this.renderClaimSubmit()}
      </div>)
  }
}