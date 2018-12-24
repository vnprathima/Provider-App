import React, { Component } from 'react';

import InputBox from '../components/InputBox';

import DropdownPatient from '../components/DropdownPatient';
import DropdownCDSHook from '../components/DropdownCDSHook';
import DropdownEncounter from '../components/DropdownEncounter';
import DropdownInput from '../components/DropdownInput';
import DropdownCodeInput from '../components/DropdownCodeInput';
import DropdownResourceType from '../components/DropdownResourceType';
import DropdownResourceTypeLT from '../components/DropdownResourceTypeLT';
import DisplayBox from '../components/DisplayBox';
import CheckBox from '../components/CheckBox';
import { createJwt } from '../components/AuthenticationJwt';


import '../index.css';
import '../components/consoleBox.css';
import Loader from 'react-loader-spinner';
import config from '../properties.json';
import KJUR, { KEYUTIL } from 'jsrsasign';
import { createToken } from '../components/Authentication';
import ReactTable from "react-table";
import 'react-table/react-table.css';

const types = {
  error: "errorClass",
  info: "infoClass",
  debug: "debugClass",
  warning: "warningClass"
}


export default class CoverageDetermination extends Component {
  constructor(props) {
    super(props);
    this.state = {
      patient: null,
      resourceType: null,
      resourceTypeLT: null,
      // encounterId:null,
      encounter: null,
      response: null,
      token: null,
      oauth: false,
      loading: false,
      upload: null,
      logs: [],
      cards: [],
      hook: null,
      resource_records: {},
      keypair: KEYUTIL.generateKeypair('RSA', 2048),
      prior_auth: false,
      errors: {},
    }
    this.validateMap = {
      // age:(foo=>{return isNaN(foo)}),
      // encounterId:(foo=>{return isNaN(foo)}),
      // gender:(foo=>{return foo!=="male" && foo!=="female"}),
      status: (foo => { return foo !== "draft" && foo !== "open" }),
      code: (foo => { return !foo.match(/^[a-z0-9]+$/i) })
    };
    // this.updateStateElement = this.updateStateElement.bind(this);
    this.startLoading = this.startLoading.bind(this);
    this.submit_info = this.submit_info.bind(this);
    this.submit_prior_auth = this.submit_prior_auth.bind(this);
    this.consoleLog = this.consoleLog.bind(this);
    this.uploadFile = this.uploadFile.bind(this);

    this.getResourceRecords = this.getResourceRecords.bind(this);
    if (window.location.href.indexOf("appContext") > -1) {
      this.appContext = JSON.parse(decodeURIComponent(window.location.href.split("?")[1]).split("appContext=")[1]);
      this.getResourceRecords(this.appContext);
    }
    else {
      this.appContext = null;
    }
    // console.log("this.appContext");
    // console.log(this.appContext);
  }
  consoleLog(content, type) {
    let jsonContent = {
      content: content,
      type: type
    }
    this.setState(prevState => ({
      logs: [...prevState.logs, jsonContent]
    }))
  }

  //file upload





  updateStateElement = (elementName, text) => {
    console.log('wht element name', elementName)
    this.setState({ [elementName]: text });
  }

  startLoading() {
    this.setState({ loading: true }, () => {
      this.submit_info();
    });
  }
  handleUploadChange = (event) => {
    console.log('Selected file:', event.target.files);
  }

  submit_prior_auth() {
    // this.setState({prior_auth:true};
    // this.state.prior_auth = true;
    this.state.prior_auth = true;
    this.setState({ prior_auth: true });
    console.log(this.state.prior_auth, '--------------');
    this.setState({ loading: true }, () => {
      this.submit_info();
    });
  }

  async getResourceRecords(appContext) {
    let tokenResponse = await createToken();
    console.log(tokenResponse);
    // appContext[0].map((obj) => {
    // console.log("obj")
    Object.keys(appContext[0]).map((valueset) => {
      console.log("valueset", valueset);
      this.getValusets(valueset, tokenResponse.access_token);
    })
    // });
  }

  async getValusets(valueset, token) {
    const url = config.fhir_url + valueset;
    // const url = "http://localhost:8181/hapi-fhir-jpaserver-example/baseDstu3/"+valueset;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "authorization": "Bearer " + token,
        "Allow-Control-Allow-Origin": "*",
        "cache-control": "no-cache"
      },

    }).then((response) => {
      return response.json();
    }).then((response) => {
      console.log("Respspspsps");
      console.log(response);

    })
  }
  uploadFile(event) {
    this.state.upload = event.target.files;
    console.log(this.state.upload, 'how many fielssss');

  }
  // async getJwt(){
  //   let jwt = await jwt();
  //   return jwt;
  // }

  validateState() {
    const validationResult = {};
    Object.keys(this.validateMap).forEach(key => {
      if (this.state[key] && this.validateMap[key](this.state[key])) {
        // Basically we want to know if we have any errors
        // or empty fields, and we want the errors to override
        // the empty fields, so we make errors 0 and unpopulated
        // fields 2.  Then we just look at whether the product of all
        // the validations is 0 (error), 1 (valid) , or >1 (some unpopulated fields).
        validationResult[key] = 0;
      } else if (this.state[key]) {
        // the field is populated and valid
        validationResult[key] = 1;
      } else {
        // the field is not populated
        validationResult[key] = 2
      }
    });

    return validationResult;
  }
  async submit_info() {
    this.consoleLog("Initiating form submission", types.info);
    let json_request = this.getJson();
    console.log(JSON.stringify(json_request))
    console.log("Req: ", json_request);
    var auth = 'Basic ' + new Buffer(config.username + ':' + config.password).toString('base64');
    var myHeaders = new Headers({
      "Content-Type": "application/json",
      "authorization": auth,
    });
    let inputData = {};
    let jwt = await createJwt();
    console.log('jwttttt', jwt)
    jwt = "Bearer " + jwt;
    for (var i = 0; i < this.state.upload.length; i++) {
      var reader = new FileReader();
      reader.readAsBinaryString(this.state.upload[i]);
      console.log(this.state.upload[i], 'here first');
      let content_type = this.state.upload[i].type;
      let file_name = this.state.upload[i].name;
      reader.onloadend = (f) => {
        inputData = {
          "resourceType": "Communication",
          "id": "376",
          "meta": {
            "versionId": "1",
            "lastUpdated": "2018-10-08T07:22:32.421+00:00"
          },
          "status": "preparation",
          "identifier": [
            {
              "use": "official"
            }
          ],
          "payload": [{
            "contentAttachment": {
              "data": reader.result,
              "contentType": content_type,
              "title": file_name,
              "language": "en"
            }
          }]
        }

        let resp = fetch("http://localhost:8080/hapi-fhir-jpaserver-example/baseDstu3/Communication?_format=json&_pretty=true", {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            "authorization": jwt,
          },
          // body: JSON.stringify(json_request)
          body: JSON.stringify(inputData),
        })
        // const res_json =   resp.json();
        console.log("res_json,'ppppppppppppppppppppppp", resp);
        console.log(resp);
      }
    }
    let url = '';
    if (this.state.prior_auth) {
      url = config.provider_prior_authorization_url;
    }
    else {
      console.log(this.state.prior_auth, '----------')
      url = config.provider_coverage_decision_url;
    }
    console.log("Fetching response from " + url + ",types.info")
    this.consoleLog("Fetching response from " + url + ",types.info")
    try {

      const fhirResponse = await fetch(url, {
        method: config.provider_response_method_post,
        headers: myHeaders,
        body: JSON.stringify(json_request)
      })
      // .then(response => {
      // console.log("Fetching response from http://54.227.173.76:8446/coverage_determination/",types.info,fhirResponse,fhirResponse.status);
      //   console.log("Recieved response",response)
      //   this.consoleLog("Recieved response",types.info);
      //     // return response.json();
      //     // let res = {cards:[{
      //     //   summary:fhirResponse
      //     // }]}
      //     // // Object.assign({}, this.state.response);
      //     // // res.cards[0]['summary'] = fhirResponse
      //     // // this.state.response.cards[0].summary=fhirResponse
      //     // // console.log(this.state.response.cards[0].summary,'oooooo');
      //     console.log(response.json(),'lllllllll')
      //   return response.json();
      //   // this.setState({response: JSON.stringify(fhirResponse)});
      //
      // }).catch(reason => this.consoleLog("No response recieved from the server", types.error));
      const res_json = await fhirResponse.json();
      console.log("res_json");
      console.log(res_json);
      this.setState({ response: res_json });

      if (fhirResponse && fhirResponse.status) {
        this.consoleLog("Server returned status "
          + fhirResponse.status + ": "
          + fhirResponse.error, types.error);
        this.consoleLog(fhirResponse.message, types.error);
      } else {
        // console.log(fhirResponse,'pppppppppppp');

        // this.setState({response: fhirResponse});
        this.setState({ response: res_json });
      }
      this.setState({ loading: false });
    } catch (error) {
      this.setState({ loading: false });
      this.consoleLog("Unexpected error occured", types.error)
      // this.consoleLog(e.,types.error);
      if (error instanceof TypeError) {
        this.consoleLog(error.name + ": " + error.message, types.error);
      }
    }

  }

  renderClaimSubmit() {
    const status_opts = config.status_options;
    // const validationResult = this.validateState();
    const validationResult = this.validateState();
    const total = Object.keys(validationResult).reduce((previous, current) => {
      return validationResult[current] * previous
    }, 1);
    return (
      <React.Fragment>
        {/* <div>In Coverage determination forsm submit..</div> */}
        <div>
          <div className="main_heading">HEALTH INSURANCE CLAIM SUBMIT</div>
          <div className="form-group">
            <div className="left-form">
              <div className="header">
                Patient Information
                  </div>
              <div className="left-col">
                <div className="col-name">Patient Name</div>
                <div className="col-name">Date of Birth</div>
              </div>
              <div className="right-col">
                <div className="col-val">James</div>
                <div className="col-val">23-10-1970</div>
              </div>
              <div className="header">
                Condition
              </div>
              <div className="left-col">
                <div className="col-name">Code</div>
                <div className="col-name">Clinical Status</div>
                <div className="col-name">Verification Status</div>
                <div className="col-name">Severity</div>
                <div className="col-name">Onset</div>
              </div>
              <div className="right-col">
                <div className="col-val">End Stage Liver Disease</div>
                <div className="col-val">Active</div>
                <div className="col-val">Confirmed</div>
                <div className="col-val">Moderate to severe</div>
                <div className="col-val">08/03/2013</div>
              </div>
              <div className="header">
                Procedure
                  </div>
              <div className="left-col">
                <div className="col-name">Status</div>
                <div className="col-name">Code</div>
                <div className="col-name">Context</div>
                <div className="col-name">Body Site</div>
                <div className="col-name">Outcome</div>
                <div className="col-name">Performed</div>
              </div>
              <div className="right-col">
                <div className="col-val">Completed</div>
                <div className="col-val">Transplantation of liver (procedure)</div>
                <div className="col-val">Encounter/f002</div>
                <div className="col-val">Lung structure</div>
                <div className="col-val">Improved Blood Circulation</div>
                <div className="col-val">08/03/2013</div>
              </div>

              <div className="header">Location</div>
              <div>                     
                  <div className="left-col">Status</div>
                  <div className="right-col">Active</div>
              </div>
              <div>
                  <div className="left-col">Address</div>
                  <div className="right-col">Ambulatory Health Care Facilities; Clinic/Center,
                                           Federally Qualified Health Center (FQHC)</div>
              </div>
              <div>
                <div className="left-col">Mode</div>
                <div className="right-col">Instance</div>
              </div>
              <div className="header">
                Episode Of Care
                  </div>
              <div className="left-col">
                <div className="col-name">Status</div>
                <div className="col-name">Type</div>
                <br />
                <div className="col-name">Status History</div>
                <div>Status</div>
                <div>Period</div>
                <div>-Start</div>
                <div>-End</div>
                <div className="col-name">Diagnosis</div>
                <div>-Condition</div>
                <div>-Role</div>
              </div>
              <div className="right-col">
                <div className="col-val">Active</div>
                <div className="col-val">Aftercare for liver transplant done (situation)</div>
                <br />
                <div className="col-val">Active</div>
                <br />
                <div className="col-val">2014-09-15</div>
                <div className="col-val">2014-09-21</div>
                <br />
                <div className="col-val">Condition/stroke</div>
                <div className="col-val">Chief Complaint</div>
              </div>

              <div className="header">
                Medication Statement
                  </div>
              <div className="left-col">
                <div className="col-name">Code</div>
                <br />
                <div className="col-name">Status</div>
                <div className="col-name">Subject</div>
                <div className="col-name">Effective DateTime</div>
                <div className="col-name">Date Asserted</div>
                <div className="col-name">Taken</div>
                <div className="col-name">Reason Not Taken</div>
              </div>
              <div className="right-col">
                <div className="col-val">Prescription medication started (situation)ctive</div>
                <div className="col-val">Active</div>
                <div className="col-val">Donald Duck</div>
                <div className="col-val">2014-09-21</div>
                <div className="col-val">2014-10-22</div>
                <div className="col-val">No</div>
                <div className="col-val">Liver enzymes abnormal</div>
              </div>
            </div>
            <div className="right-form">
              <div className="header">
                Upload Required/Additional Documentation 
                  </div>
              <div className="">
                <div className="left-col">Required Documents</div>
                <div className="right-col">Seven Element order, Xray of Liver</div>
              </div>
              <div className="">
              <div className="left-col">
                <input type="file"
                  name="myFile"
                  onChange={this.uploadFile}
                  multiple />
              </div>
              <div className="right-col">-</div>
              </div>
              <div className="header">
                Additional Notes 
              </div>
              <div className="docs">
                <textarea name="myNotes" rows="10" cols="83" />
              </div>

              <button className={"submit-btn btn btn-class " + (!total ? "button-error" : total === 1 ? "button-ready" : "button-empty-fields")} onClick={this.startLoading}>Submit
              </button>
            <div id="fse" className={"spinner " + (this.state.loading ? "visible" : "invisible")}>
              <Loader
                type="Oval"
                color="#222222"
                height="16"
                width="16"
              />
            </div>
            </div>
            
          </div>
        </div>
      </React.Fragment>);
  };
  getJson() {
    const birthYear = 2018 - parseInt(this.state.age, 10);
    var patientId = null;
    var practitionerId = null;
    var coverageId = null;
    var encounterId = '';
    var gender = null;
    console.log(this.state.patient, 'sdfghhhhhj')
    // if(this.state.patient != null){
    //    patientId = this.state.patient.replace("Patient/","");
    // }
    // else{
    //   this.consoleLog("No© client id provided in properties.json",this.warning);
    // }
    patientId = this.state.patient;
    let request = {
      hookInstance: config.provider_hook_instance,
      // fhirServer: config.fhir_url,
      hook: this.state.hook,
      // fhirAuthorization : {
      //   "access_token" : this.state.token,
      //   "token_type" : config.token_type, // json
      //   "expires_in" : config.expires_in, // json
      //   "scope" : config.fhir_auth_scope,
      //   "subject" : config.fhir_auth_subject,
      // },
      // user: this.state.practitioner, // select
      context: {
        patientId: patientId,  // select
        orders: {
          resourceType: "Bundle",
          entry: [
            {
              resource: {
                resourceType: "Patient",
                id: patientId
              }
            },
            {
              resource: {
                resourceType: this.state.resourceType,  // select
                id: "6-1",
                codeCodeableConcept: {
                  coding: [
                    {
                      system: this.state.codeSystem,
                      code: this.state.code
                    }
                  ]
                },
              }
            }
          ]
        }
      }
    };
    if (this.state.hook === 'order-review') {
      request.context.encounterId = this.state.encounter
    }
    console.log(request)
    return request;
  }
  render() {
    const data = [{
      ResourceType: 'Patient',
      ResourceData: {
        name: 'Jason Maurer',
        age: 23,
      }
    }]

    const columns = [{
      Header: 'Requirement',
      accessor: 'ResourceType' // String-based value accessors!
    }, {
      id: 'ResourceData',
      Header: 'Input Data',
      accessor: d => d.ResourceData,
      Cell: row => <div><span>{row.value.name}</span>[<span className='number'>{row.value.age}</span>]</div> // Custom cell components!
    }]

    return (

      <div className="attributes mdl-grid">
        {this.renderClaimSubmit()}
        {/* <ReactTable  minRows='3' showPagination='false' data={data} columns={columns}/> */}
      </div>)
  }
}
