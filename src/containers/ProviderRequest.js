import React, {Component} from 'react';
import DropdownPatient from '../components/DropdownPatient';
import DropdownCDSHook from '../components/DropdownCDSHook';
import DropdownEncounter from '../components/DropdownEncounter';
import DropdownInput from '../components/DropdownInput';
import DropdownCodeInput from '../components/DropdownCodeInput';
import DropdownResourceType from '../components/DropdownResourceType';
import DropdownResourceTypeLT from '../components/DropdownResourceTypeLT';
import DisplayBox from '../components/DisplayBox';
import CheckBox from '../components/CheckBox';
import 'font-awesome/css/font-awesome.min.css';
import { faListAlt, faAmericanSignLanguageInterpreting } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import '../index.css';
import '../components/consoleBox.css';
import Loader from 'react-loader-spinner';
import config from '../properties.json';
import KJUR, {KEYUTIL} from 'jsrsasign';
import {createToken} from '../components/Authentication';

const types = {
    error: "errorClass",
    info: "infoClass",
    debug: "debugClass",
    warning: "warningClass"
  }

export default class ProviderRequest extends Component {
  constructor(props){
    super(props);
    this.state = {
        patient:null,
        resourceType:null,
        resourceTypeLT:null,
        // encounterId:null,
        encounter:null,
        request:"coverage-requirement",
        response:null,
        token: null,
        oauth:false,
        loading:false,
        logs:[],
        cards:[],
        hook:null,
        resource_records:{},
        keypair:KEYUTIL.generateKeypair('RSA',2048),
        prior_auth:false,
        button_disable: false,
        color:'grey',
        req_active:'active',
        auth_active:'',
        prefetchData:{},
        prefetch:false,
      errors: {},
    }
    this.validateMap={
        // age:(foo=>{return isNaN(foo)}),
        // encounterId:(foo=>{return isNaN(foo)}),
        // gender:(foo=>{return foo!=="male" && foo!=="female"}),
        status:(foo=>{return foo!=="draft" && foo!=="open"}),
        code:(foo=>{return !foo.match(/^[a-z0-9]+$/i)})
    };
    this.startLoading = this.startLoading.bind(this);
    this.submit_info = this.submit_info.bind(this);
    this.consoleLog = this.consoleLog.bind(this);
    this.getPrefetchData = this.getPrefetchData.bind(this);
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
      console.log("Element---",elementName,"value--",text);
      this.setState({ [elementName]: text});
    }

    startLoading(){
      this.setState({loading:true}, ()=>{
          this.submit_info();
      });
    }
    
    async getPrefetchData() {
      console.log(this.state.hook);
      if(this.state.hook === "patient-view" || this.state.hook === "liver-transplant" ){
        var prefectInput = {"Patient":this.state.patient};
      }
      else if(this.state.hook === "order-review"){
        var prefectInput = {
                            "Patient":this.state.patientId,
                            "Encounter":this.state.encounterId,
                            "Practitioner":this.state.practitionerId,
                            "Coverage":this.state.coverageId
                            };
      } else if(this.state.hook === "medication-prescribe"){
        var prefectInput = {
                              "Patient":this.state.patient,
                              "Practitioner":this.state.practitionerId
                            };
      }
      let tokenResponse = await createToken();
      await this.getResourceData( tokenResponse,prefectInput);
      // return prefetchData;
    }

    async getResourceData( token,prefectInput) {
      console.log("Prefetch input--",JSON.stringify(prefectInput));
      const url = config.crd_url + "prefetch";
      // const url = "http://localhost:8181/hapi-fhir-jpaserver-example/baseDstu3/"+valueset;
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "authorization": "Bearer " + token,
        },
        body: JSON.stringify(prefectInput),
      }).then((response) => {
        return response.json();
      }).then((response) => {
        console.log("Prefetch json---before--",response);
        this.setState({prefetchData: response});
        // return response;
        console.log("Prefetch json---after--",this.state.prefetchData);
      })
    }

    setRequestType(req){
      this.setState({request:req});
      if (req==="coverage-requirement"){
          this.setState({auth_active:""});
          this.setState({req_active:"active"});
      }
      if (req==="prior-authorization"){
          this.setState({auth_active:"active"});
          this.setState({req_active:""});
      }
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
        this.consoleLog("Initiating form submission",this.state.prefetch);
        let json_request = await this.getJson();
        console.log(JSON.stringify(json_request))
        console.log("Req: ",json_request);
        // var token = 'Basic ' + new Buffer(config.username + ':' + config.password).toString('base64');
        let token = await createToken();
        token = "Bearer " + token;
        var myHeaders = new Headers({
            "Content-Type": "application/json",
            "authorization": token,
        });
        let url='';
        if(this.state.request == 'prior-authorization'){
            url = config.provider_prior_authorization_url;
            
        }
        else if(this.state.request == 'coverage-requirement'){
            url = config.provider_coverage_requirement_url;
        }
        else{
            url = config.provider_coverage_decision_url;
        }
        console.log("Fetching response from "+url+",types.info")
        this.consoleLog("Fetching response from "+url+",types.info")
        try{
            const fhirResponse= await fetch(url,{
                method: config.provider_response_method_post,
                headers: myHeaders,
                body: JSON.stringify(json_request)
            })
            const res_json = await  fhirResponse.json();
            console.log("res_json");
            console.log(res_json);
            this.setState({response: res_json});

            if(fhirResponse && fhirResponse.status){
              this.consoleLog("Server returned status "
                              + fhirResponse.status + ": "
                              + fhirResponse.error,types.error);
              this.consoleLog(fhirResponse.message,types.error);
            }else{
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
    const status_opts = config.status_options;
    // const validationResult = this.validateState();
    const validationResult = this.validateState();
    const total = Object.keys(validationResult).reduce((previous,current) =>{
        return validationResult[current]*previous
    },1);
      return (
        <React.Fragment>
          <div>
            <div className="main_heading">HEALTH INSURANCE REQUEST FORM</div>
            <div className="content">
              <div className="left-form">
              <div>
                <div className="tab">
                  <div className={"requirements-icon "  + this.state.req_active} onClick={() => this.setRequestType('coverage-requirement')}>
                    <FontAwesomeIcon icon={faListAlt}  />
                      &nbsp;Coverage Requirements
                  </div>
                  <div className={"priorauth-icon " + this.state.auth_active} onClick={() => this.setRequestType('prior-authorization')}>
                    <FontAwesomeIcon icon={faAmericanSignLanguageInterpreting} />
                    &nbsp;Prior Authorization
                  </div>
                </div>
                {/* <div className="header">
                            Request Type 
                </div>
                <div className="dropdown">
                <DropdownRequest
                    elementName="request"
                    updateCB={this.updateStateElement}
                  />
                </div> */}
                </div>
                <div>
                <div className="header">
                            Diagnosis or Nature of illness or Injury
                </div>
                <div className="dropdown">
                <DropdownCDSHook
                    elementName="hook"
                    updateCB={this.updateStateElement}
                  />
                </div>
                </div>
                <div>
                  <div className="header">
                          Patient's Name
                  </div>
                  <div className="dropdown">
                  <DropdownPatient
                    elementName="patient"
                    updateCB={this.updateStateElement}
                  />
                  </div>
                </div>
                {this.state.hook === 'order-review' &&
                  <div>
                    <div>
                      <div className="header">
                              Procedures,Services or Supplies
                      </div>
                      <div className="dropdown">
                      <DropdownResourceTypeLT
                        elementName="resourceTypeLT"
                        updateCB={this.updateStateElement}
                      />
                      </div>
                  </div>
                  <div>
                    <div className="header">
                            Encounter Detail
                    </div>
                    <div className="dropdown">
                    <DropdownEncounter
                      elementName="encounter"
                      updateCB={this.updateStateElement}
                    />
                    </div>
                  </div>
                  <div>
                    <div className="header">
                        SNOMED/HCPCS Code
                    </div>
                    <div className="dropdown">
                    <DropdownInput
                        elementName='code'
                        updateCB={this.updateStateElement}
                        />
                    </div>
                    </div>
                  </div>
                }
                {this.state.hook === 'liver-transplant' &&
                  <div>
                    <div>
                      <div className="header">
                              Procedures,Services or Supplies
                      </div>
                      <div className="dropdown">
                      <DropdownResourceType
                        elementName="resourceType"
                        updateCB={this.updateStateElement}
                      />
                      </div>
                    </div>
                    <div>
                      <div className="header">
                          SNOMED/HCPCS Code
                      </div>
                      <div className="dropdown">
                      <DropdownCodeInput
                          elementName='code'
                          updateCB={this.updateStateElement}
                          />
                        </div>
                      </div>
                  </div>
                }
                {this.state.request === 'coverage-requirement' &&
                      <CheckBox elementName="prefetch" displayName="Include Prefetch" updateCB={this.updateStateElement}/>
                      }

                <button className={"submit-btn btn btn-class "+ (!total ? "button-error" : total===1 ? "button-ready":"button-empty-fields")} onClick={this.startLoading}>Submit
                  
                  {/* {this.state.request === 'prior-authorization' &&
                  <button className={"submit-btn btn btn-class "+ (!total ? "button-error" : total===1 ? "button-ready":"button-empty-fields")} onClick={this.submit_prior_auth}>Submit Prior Authorization
                  </button>
                  } */}
                
                    <div id="fse" className={"spinner " + (this.state.loading?"visible":"invisible")}>
                    <Loader
                      type="Oval"
                      color="#ffffff"
                      height="16"
                      width="16"
                    />
                    </div>
                      </button>
                      
              </div>
              {this.state.request === 'coverage-requirement' &&
                <div className="right-form">
                <DisplayBox
                response = {this.state.response} req_type="coverage_requirement" patientId={this.state.patient} hook={this.state.hook}  />
                </div>
                }
                {this.state.request === 'prior-authorization' &&
                <div className="right-form">
                <DisplayBox
                response = {this.state.response} req_type="prior-authorization" patientId={this.state.patient} hook={this.state.hook}  />
                </div>
                }
                {this.state.request !== 'coverage-requirement' && this.state.request !== 'prior-authorization' &&
                <div className="right-form">
                        <DisplayBox
                        response = {this.state.response} req_type="coverage_determination" patientId={this.state.patient} hook={this.state.hook} />
                    </div>
                }
              </div>
        </div>
      </React.Fragment>);
    };
    async getJson(){
        var patientId =  null;
        var practitionerId = null;
        var coverageId = null ;
        var encounterId='';
        
        // if(this.state.patient != null){
        //    patientId = this.state.patient.replace("Patient/","");
        // }
        // else{
        //   this.consoleLog("No© client id provided in properties.json",this.warning);
        // }
        patientId=this.state.patient;
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
        if (this.state.prefetch) {
            var prefetchData = await this.getPrefetchData();
            console.log("Prefetch data---",this.state.prefetchData);
              request.prefetch =  this.state.prefetchData;
          }
        return request;
      }
  render() {
    return (
      <div className="attributes mdl-grid">
          {this.renderClaimSubmit()}
      </div>)
  }
}