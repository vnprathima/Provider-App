import React, {Component} from 'react';

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

import '../index.css';
import '../components/consoleBox.css';
import Loader from 'react-loader-spinner';
import config from '../properties.json';
import KJUR, {KEYUTIL} from 'jsrsasign';
import {login} from '../components/Authentication';



const types = {
  error: "errorClass",
  info: "infoClass",
  debug: "debugClass",
  warning: "warningClass"
}
export default class CoverageDetermination extends Component {
  constructor(props){
    super(props);
    this.state = {
        patient:null,
        resourceType:null,
        resourceTypeLT:null,
        // encounterId:null,
        encounter:null,
        response:null,
        token: null,
        oauth:false,
        loading:false,
        logs:[],
        cards:[],
        hook:null,
        resource_records:{},
        keypair:KEYUTIL.generateKeypair('RSA',2048),
      errors: {},
    }
    this.validateMap={
      // age:(foo=>{return isNaN(foo)}),
      // encounterId:(foo=>{return isNaN(foo)}),
      // gender:(foo=>{return foo!=="male" && foo!=="female"}),
      status:(foo=>{return foo!=="draft" && foo!=="open"}),
      code:(foo=>{return !foo.match(/^[a-z0-9]+$/i)})
  };
  // this.updateStateElement = this.updateStateElement.bind(this);
  this.startLoading = this.startLoading.bind(this);
  this.submit_info = this.submit_info.bind(this);
  this.consoleLog = this.consoleLog.bind(this);
  this.getResourceRecords = this.getResourceRecords.bind(this);
  if(window.location.href.indexOf("appContext") > -1){
    this.appContext = JSON.parse(decodeURIComponent(window.location.href.split("?")[1]).split("appContext=")[1]);
    this.getResourceRecords(this.appContext);
  }
  else{
    this.appContext = null ;
  }
  // console.log("this.appContext");
  // console.log(this.appContext);
  }
  consoleLog(content, type){
    let jsonContent = {
      content: content,
      type: type
    }
    this.setState(prevState => ({
      logs: [...prevState.logs, jsonContent]
    }))
  }

updateStateElement = (elementName, text) => {
  console.log('wht element name',elementName,)
  this.setState({ [elementName]: text});
}

startLoading(){
  this.setState({loading:true}, ()=>{
    this.submit_info();
  });
}

async getResourceRecords(appContext){
  let tokenResponse = await login();
  appContext.requirements.map((obj) => {
    // console.log("obj")
    // console.log(obj)
    Object.keys(obj).map((valueset)=>{
      // console.log("valueset")
      this.getValusets(obj,valueset,tokenResponse.access_token);
      


    })
  });
}

async getValusets(obj,valueset,token){
  const url = "http://54.227.173.76:8181/fhir/baseDstu3/"+valueset
  const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type":"application/x-www-form-urlencoded",
            "authorization":"Bearer "+token,
            "Access-Control-Allow-Origin":"*"
        },
        
      }).then((response) =>{
          return response.json();
      }).then((response)=>{
        console.log("Respspspsps");
        console.log(response);

      })
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
async submit_info(){
  this.consoleLog("Initiating form submission",types.info);
  let json_request = this.getJson();
  console.log(JSON.stringify(json_request))
  console.log("Req: ",json_request);
  var auth = 'Basic ' + new Buffer('john' + ':' + 'john123').toString('base64');
  var myHeaders = new Headers({
    "Content-Type": "application/json",
    "authorization": auth,
  });

      this.consoleLog("Fetching response from http://54.227.173.76:8090/coverage_determination/",types.info)
      try{

        const fhirResponse= await fetch("http://54.227.173.76:8090/coverage_determination",{
            method: "POST",
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
        const res_json = await  fhirResponse.json();
        console.log("res_json");
        console.log(res_json);
        this.setState({response: res_json});
   
        if(fhirResponse && fhirResponse.status){
          console.log(fhirResponse,'oooooooooo');

          this.consoleLog("Server returned status "
                          + fhirResponse.status + ": "
                          + fhirResponse.error,types.error);
          this.consoleLog(fhirResponse.message,types.error);
        }else{
          console.log(fhirResponse,'pppppppppppp');

          // this.setState({response: fhirResponse});
          this.setState({response: res_json});
        }
      this.setState({loading:false});
      }catch(error){
        this.setState({loading:false});
        this.consoleLog("Unexpected error occured",types.error)
        // this.consoleLog(e.,types.error);
        if(error instanceof TypeError){
          this.consoleLog(error.name + ": " + error.message,types.error);
        }
      }

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
    // const validationResult = this.validateState();
    const validationResult = this.validateState();
    const total = Object.keys(validationResult).reduce((previous,current) =>{
        return validationResult[current]*previous
    },1);
    return (
      <React.Fragment>
          {/* <div>In Coverage determination forsm submit..</div> */}
          <div>
          <div className="form-group container left-form">
            <div>
            <div className="header">
                        CDS Hook
            </div>
            <DropdownCDSHook
                elementName="hook"
                updateCB={this.updateStateElement}
              />
            </div>
            <div>
              <div className="header">
                      Patient
              </div>
              <DropdownPatient
                elementName="patient"
                updateCB={this.updateStateElement}
              />
            </div>
            {this.state.hook === 'order-review' &&
              <div>
                <div>
                  <div className="header">
                          Resource Type
                  </div>
                  <DropdownResourceTypeLT
                    elementName="resourceTypeLT"
                    updateCB={this.updateStateElement}
                  />
              </div>
              <div>
                <div className="header">
                        Encounter
                </div>
                <DropdownEncounter
                  elementName="encounter"
                  updateCB={this.updateStateElement}
                />
              </div>
              <div>
                <div className="header">
                    Code
                </div>
                <DropdownInput
                    elementName='code'
                    updateCB={this.updateStateElement}
                    />
                <br />
                </div>
              </div>
            }
            {this.state.hook === 'liver-transplant' &&
              <div>
                <div>
                  <div className="header">
                          Resource Type
                  </div>
                  <DropdownResourceType
                    elementName="resourceType"
                    updateCB={this.updateStateElement}
                  />
                </div>
                <div>
                  <div className="header">
                      Code
                  </div>
                  <DropdownCodeInput
                      elementName='code'
                      updateCB={this.updateStateElement}
                      />
                  <br />
                  </div>
              </div>
            }


            <button className={"submit-btn btn btn-class "+ (!total ? "button-error" : total===1 ? "button-ready":"button-empty-fields")} onClick={this.startLoading}>Submit
              </button>
            
              <button className={"submit-btn btn btn-class "+ (!total ? "button-error" : total===1 ? "button-ready":"button-empty-fields")} onClick={this.startLoading}>Submit Claim
              </button>
              {/* <CheckBox elementName="prefetch" displayName="Include Prefetch" updateCB={this.updateStateElement}/> */}
                <div id="fse" className={"spinner " + (this.state.loading?"visible":"invisible")}>
                <Loader
                  type="Oval"
                  color="#222222"
                  height="16"
                  width="16"
                />
                </div>
          </div>
          <div className="right-form">
                <DisplayBox
                response = {this.state.response} req_type="coverage_determination" />
            </div>


        </div>
      </React.Fragment>);
    };
    getJson(){
      const birthYear = 2018-parseInt(this.state.age,10);
      var patientId =  null;
      var practitionerId = null;
      var coverageId = null ;
      var encounterId='';
      var gender=null;
      console.log(this.state.patient,'sdfghhhhhj')
      // if(this.state.patient != null){
      //    patientId = this.state.patient.replace("Patient/","");

      // }
      // else{
      //   this.consoleLog("No© client id provided in properties.json",this.warning);
      // }
      patientId=this.state.patient;
      let request = {
        hookInstance: "d1577c69-dfbe-44ad-ba6d-3e05e953b2ea",
        // fhirServer: "http://54.227.173.76:8090/fhir/basedstu3",
        hook: this.state.hook,
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
          orders: {
            resourceType: "Bundle",
            entry: [
              {
                resource:{
                  resourceType:"Patient",
                  id:patientId
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
      if(this.state.hook==='order-review')
      {
       request.context.encounterId = this.state.encounter
      }
      console.log(request)
      return request;
    }
  render() {
    return (
      <div className="attributes mdl-grid">
          {this.renderClaimSubmit()}
      </div>)
  }
}
