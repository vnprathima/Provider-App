import React, {Component} from 'react';
import DropdownPatient from '../components/DropdownPatient';
import DropdownCDSHook from '../components/DropdownCDSHook';
import DropdownEncounter from '../components/DropdownEncounter';
import DropdownInput from '../components/DropdownInput';
import DropdownRequest from '../components/DropdownRequest';
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
        request:null,
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
    // this.submit_prior_auth = this.submit_prior_auth.bind(this);
    this.consoleLog = this.consoleLog.bind(this);
    this.getResourceRecords = this.getResourceRecords.bind(this);
    if(window.location.href.indexOf("appContext") > -1){
      this.appContext = JSON.parse(decodeURIComponent(window.location.href.split("?")[1]).split("appContext=")[1]);
      this.getResourceRecords(this.appContext);
    }
    else{
        this.appContext = null ;
    }

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
    this.setState({ [elementName]: text});
    }

    startLoading(){
    this.setState({loading:true}, ()=>{
        this.submit_info();
    });
    }
    async getResourceRecords(appContext){
        let tokenResponse = await createToken();
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
    const url = config.fhir_url+valueset;
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
    // submit_prior_auth(){
    //     // this.setState({prior_auth:true};
    //     // this.state.prior_auth = true;
    //     this.state.prior_auth = true;
    //     this.setState({prior_auth:true});
    //     console.log(this.state.prior_auth,'--------------');
    //     this.setState({loading:true }, ()=>{
    //       this.submit_info();
    //     });
    //   }
    async submit_info(){
    this.consoleLog("Initiating form submission",types.info);
    let json_request = this.getJson();
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
    if(this.state.request== 'prior-authorization'){
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
        // console.log(fhirResponse,'pppppppppppp');

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
                <div className="header">
                            Request Type 
                </div>
                <div className="dropdown">
                <DropdownRequest
                    elementName="request"
                    updateCB={this.updateStateElement}
                  />
                </div>
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
                response = {this.state.response} req_type="coverage_requirement" patientId={this.state.patient} />
                </div>
                }
                {this.state.request !== 'coverage-requirement' &&
                <div className="right-form">
                        <DisplayBox
                        response = {this.state.response} req_type="coverage_determination" />
                    </div>
                }
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
        console.log(request)
        if (this.state.prefetch) {
            request.prefetch = {
              deviceRequestBundle: {
                resourceType: "Bundle",
                type: "collection",
                entry: [
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
                  },
                  {
                    resource: {
                      resourceType: "Patient",
                      id: patientId,
                      gender: this.state.gender,
                      birthDate: birthYear + "-01-23",
                      address: [
                        {
                          use: "home",
                          type: "both",
                          state: this.state.patientState
                        }
                      ]
                    }
                  }
                ]
              }
            };
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