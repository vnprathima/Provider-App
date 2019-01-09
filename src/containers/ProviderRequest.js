import React, {Component} from 'react';
import DropdownPatient from '../components/DropdownPatient';
import DropdownCDSHook from '../components/DropdownCDSHook';
import DropdownEncounter from '../components/DropdownEncounter';
import DropdownInput from '../components/DropdownInput';
import DropdownCodeInput from '../components/DropdownCodeInput';
import DropdownResourceType from '../components/DropdownResourceType';
import DropdownResourceTypeLT from '../components/DropdownResourceTypeLT';
import DropdownFrequency from '../components/DropdownFrequency';
import DropdownMedicationList from '../components/DropdownMedicationList';
import DropdownTreating from '../components/DropdownTreating';
import {Input,Button} from 'semantic-ui-react';
import rxnorm from '../medication-list';
import NumericInput from 'react-numeric-input';
import DatePicker from "react-datepicker";
import {DateInput} from 'semantic-ui-calendar-react';
import Cookies from 'universal-cookie';
import { withRouter } from 'react-router-dom';
import jsonData from "../example.json";
import orderReview from "../Order-Review.json";
import liverTransplant from "../liver-transplant.json";


import "react-datepicker/dist/react-datepicker.css";


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
// import Cookies from 'universal-cookie';

// const cookies = new Cookies();

const types = {
    error: "errorClass",
    info: "infoClass",
    debug: "debugClass",
    warning: "warningClass"
  }
  let allMed = [];
const cookies = new Cookies();
function getHook(text){
    console.log("First hook value");
      console.log(text);
      for(const key in orderReview){
        if(key == text)
        {
           text = "order-review";
         //  this.setState({ [elementName]: text});
            console.log("Text");
            console.log(text);
            return text;
        }
        else{
            for(const key in liverTransplant){
        if(key == text)
        {
           text = "liver-transplant";
          // this.setState({ [elementName]: text});
            console.log("Text");
            console.log(text);
            return text;
        }
        }
    }
}
}
class ProviderRequest extends Component {
  constructor(props){
    super(props);
    this.state = {
        patient:null,
        patientId:'',
        practitionerId:'',
        resourceType:null,
        resourceTypeLT:null,
        encounterId:'',
        coverageId:'',
        encounter:null,
        request:"coverage-requirement",
        response:null,
        token: null,
        oauth:false,
        treating:null,
        loading:false,
        logs:[],
        cards:[],
        medicationInput:null,
        medication:null,
        medicationStartDate:'',
        medicationEndDate:'',
        hook:null,
        resource_records:{},
        keypair:KEYUTIL.generateKeypair('RSA',2048),
        prior_auth:false,
        dosageAmount:null,
        treating:null,
        color:'grey',
        req_active:'active',
        auth_active:'',
        prefetchData:{},
        prefetch:false,
        frequency:null,
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
    this.onEncounterChange = this.onEncounterChange.bind(this);
    this.onPatientChange = this.onPatientChange.bind(this);
    this.onPractitionerChange = this.onPractitionerChange.bind(this);
    this.changeDosageAmount=this.changeDosageAmount.bind(this);
    this.changeMedicationInput=this.changeMedicationInput.bind(this);
    this.onCoverageChange=this.onCoverageChange.bind(this);
    this.changeMedicationStDate = this.changeMedicationStDate.bind(this);
    this.changeMedicationEndDate = this.changeMedicationEndDate.bind(this);
    this.onClickLogout = this.onClickLogout.bind(this);
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
      if(elementName=="hook")
      {
       let result = getHook(text);
       this.setState({ [elementName]: result});
      }
      else{
      this.setState({ [elementName]: text});
      }
      //this.setState({ [elementName]: text});
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
      let tokenResponse = await createToken(config.username,config.password);
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
      // if (req==="prior-authorization"){
      //     this.setState({auth_active:"active"});
      //     this.setState({req_active:""});
      // }
    }

    setPatientView(req,res){
      this.setState({request:req});
      this.setState({hook:res});
      this.setState({auth_active:"active"});
      this.setState({req_active:""});
    }

    onEncounterChange (event){
      this.setState({ encounterId: event.target.value });
    }
    onPatientChange (event){
      // console.log(event.target.value)
      this.setState({ patientId: event.target.value });
    }
    onPractitionerChange (event){
      this.setState({ practitionerId: event.target.value });
    }
    onCoverageChange (event){
      this.setState({ coverageId: event.target.value });
    }
    changeMedicationInput(event) {
      this.setState({ medicationInput: event.target.value });
    }
    changeMedicationStDate= (event, {name, value}) => {
      
        if (this.state.hasOwnProperty(name)) {
          this.setState({[name]: value });
        }
    }
    changeMedicationEndDate= (event, {name, value}) =>{
      if(this.state.hasOwnProperty(name))
      this.setState({ [name]: value });
    }
    changeDosageAmount(event) {
      if(event.target.value !=undefined){
        let transformedNumber = Number(event.target.value) || 1;
        if (transformedNumber > 5) { transformedNumber = 5; }
        if (transformedNumber < 1) { transformedNumber = 1; }
        this.setState({ dosageAmount: transformedNumber });
      }
      
    }
    onClickLogout () {
      // await Auth.signOut();
      cookies.set('isLoggedIn', false);
      var path = '/login';
      console.log('this.props.history',this.props.history)
      this.props.history.push(path);
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
        let token = await createToken(config.username,config.password);
        token = "Bearer " + token;
        var myHeaders = new Headers({
            "Content-Type": "application/json",
            "authorization": token,
        });
        let url='';
        // if(this.state.request == 'prior-authorization'){
        //     url = config.provider_prior_authorization_url;
            
        // }
       if(this.state.request == 'coverage-requirement'){
            url = config.provider_coverage_requirement_url;
        }
        else{
            url = config.provider_coverage_decision_url;
        }
        if(this.state.hook == 'patient-view'){
          url = config.provider_patient_view_url;
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
            <div className="main_heading">HEALTH INSURANCE REQUEST FORM <Button className={'logout'} onClick={this.onClickLogout}>Logout</Button></div>
            <div className="content">
              <div className="left-form">
              <div>
                <div className="tab">
                  <div className={"requirements-icon "  + this.state.req_active} onClick={() => this.setRequestType('coverage-requirement')}>
                    <FontAwesomeIcon icon={faListAlt}  />
                      &nbsp;Coverage Requirements
                  </div>
                  {/* <div className={"priorauth-icon " + this.state.auth_active} onClick={() => this.setRequestType('prior-authorization')}>
                    <FontAwesomeIcon icon={faAmericanSignLanguageInterpreting} />
                    &nbsp;Prior Authorization
                  </div> */} 
                  <div className={"priorauth-icon " + this.state.auth_active} onClick={() => this.setPatientView('coverage-requirement','patient-view')}>
                    <FontAwesomeIcon icon={faAmericanSignLanguageInterpreting} />
                    &nbsp;Patient View
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

                
                {this.state.auth_active !=='active' && 
                  <div>
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
                            Practitioner ID
                    </div>
                    <div >
                      <Input className='ui  fluid input' type="text" name="practitioner" fluid value={this.state.practitionerId} onChange={this.onPractitionerChange}></Input>
                    </div>
                  </div>
                  </div>
                }
                
                <div>
                  <div className="header">
                          Patient's ID
                  </div>
                  <div >
                      <Input className='ui fluid   input' type="text" name="patient" fluid value={this.state.patientId} onChange={this.onPatientChange}></Input>
                    </div>
                  {/* <div className="dropdown">
                  <DropdownPatient
                    elementName="patient"
                    updateCB={this.updateStateElement}
                  />
                  </div> */}
                  {/* <div>
                    <div className="header">
                            Practitioner ID
                    </div>
                    <div >
                      <Input className='ui  fluid input' type="text" name="practitioner" fluid value={this.state.practitionerId} onChange={this.onPractitionerChange}></Input>
                    </div>
                  </div> */}

                </div>
                {this.state.hook === 'order-review' &&
                  <div>
                    {/* <div>
                      <div className="header">
                              Procedures,Services or Supplies
                      </div>
                      <div className="dropdown">
                      <DropdownResourceTypeLT
                        elementName="resourceTypeLT"
                        updateCB={this.updateStateElement}
                      />
                      </div>
                  </div> */}
                  <div>
                    <div className="header">
                            Encounter ID
                    </div>
                    <div >
                      <Input className='ui fluid  input' type="text" name="encounter" value={this.state.encounterId} onChange={this.onEncounterChange}></Input>
                    </div>
                  </div>
                  
                  <div>
                    <div className="header">
                            Coverage ID
                    </div>
                    <div >
                      <Input className='ui fluid  input' type="text" name="coverage" fluid value={this.state.coverageId} onChange={this.onCoverageChange}></Input>
                    </div>
                  </div>
                  {/* <div>
                    <div className="header">
                        SNOMED/HCPCS Code
                    </div>
                    <div className="dropdown">
                    <DropdownInput
                        elementName='code'
                        updateCB={this.updateStateElement}
                        />
                    </div>
                    </div> */}
                  </div>
                }
            
                {this.state.hook === 'liver-transplant' &&
                  <div>
                    {/* reousrce types for liver Transplant */}
                    {/* <div>
                      <div className="header">
                              Procedures,Services or Supplies
                      </div>
                      <div className="dropdown">
                      <DropdownResourceType
                        elementName="resourceType"
                        updateCB={this.updateStateElement}
                      />
                      </div>
                    </div> */}
                    {/* Codes for Liver Transplant */}
                    {/* <div>
                      <div className="header">
                          SNOMED/HCPCS Code
                      </div>
                      <div className="dropdown">
                      <DropdownCodeInput
                          elementName='code'
                          updateCB={this.updateStateElement}
                          />
                        </div>
                      </div> */}
                  </div>
                }
                {this.state.hook === 'medication-prescribe' &&
                <div>
                  <div className="header">
                          Treating
                      </div>
                    <div className="dropdown">
                      <DropdownTreating
                          elementName='treating'
                          updateCB={this.updateStateElement}
                          />
                  </div>
                  {/* <div>
                  <div className="header">
                          Medication Input
                      </div>
                  <div className="dropdown">
                  <DropdownMedicationList
                      elementName="medication"
                      updateCB={this.updateStateElement}
                    />
                  </div>
                  </div> */}
                <div>
                    <div className='leftStateInput'>
                    <div className='header' >
                          Number
                    </div>
                    <div >
                    <Input 
                      type="number"
                      value={this.state.dosageAmount}
                       onChange={this.changeDosageAmount}
                       placeholder="Number"/></div>
                    {/* <div class="ui input"><input type="text" placeholder="Number"/></div> */}
                    </div>
                    <div className='rightStateInput'>
                      <div className="header" >
                            Frequency
                      </div>
                    <div >
                    <DropdownFrequency
                        elementName='frequency'
                        updateCB={this.updateStateElement}
                        />
                  </div>
                  </div>
                </div>
  
                <div>
                  <div className='leftStateInput'>
                  <div className="header" >
                            Start Date
                    </div>
                    <div >
                    <DateInput
                      name="medicationStartDate"
                      placeholder="Start Date"
                      value={this.state.medicationStartDate}
                      iconPosition="left"
                      onChange={this.changeMedicationStDate}
                    />
                    </div>
                    
                  </div>
                  <div className='rightStateInput'>
                  <div className="header" >
                            End Date
                    </div>
                    <div >
                    <DateInput
                      name="medicationEndDate"
                      placeholder="End Date"
                      value={this.state.medicationEndDate}
                      iconPosition="left"
                      onChange={this.changeMedicationEndDate}
                    />
                    </div>
                  
                  </div>
                </div>
                
                </div>
                }
                {this.state.request === 'coverage-requirement' && this.state.auth_active !== 'active' &&
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
                response = {this.state.response} req_type="coverage_requirement" userId={this.state.practitionerId} patientId={this.state.patientId} hook={this.state.hook}  />

                </div>
                }
                {/* {this.state.request === 'prior-authorization' &&
                <div className="right-form">
                <DisplayBox
                response = {this.state.response} req_type="prior-authorization"  userId={this.state.practitionerId}  patientId={this.state.patientId} hook={this.state.hook}  />

                </div>
                } */}
                {this.state.request !== 'coverage-requirement' && this.state.request !== 'prior-authorization' &&
                <div className="right-form">
                        <DisplayBox
                        response = {this.state.response} req_type="coverage_determination" userId={this.state.practitionerId}  patientId={this.state.patient} hook={this.state.hook} />
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
      // var encounterId='';
      patientId=this.state.patientId;
      let coverage = {
        resource: {
          resourceType: "Coverage",
          id: this.state.coverageId,
          class: [
            {
              type: {
                system: "http://hl7.org/fhir/coverage-class",
                code: "plan"
              },
              value: "Medicare Part D"
            }
          ],
          payor: [
            {
              reference: "Organization/6"
            }
          ]
        }
      };
      let medicationJson = {
        resourceType: "MedicationOrder",
        dosageInstruction: [
          {
            doseQuantity: {
              value: this.state.dosageAmount,
              system: "http://unitsofmeasure.org",
              code: "{pill}"
            },
            timing: {
              repeat: {
                frequency: this.state.frequency,
                boundsPeriod: {
                  start: this.state.medicationStartDate,
                  end:this.state.medicationEndDate,
                }
              }
            }
          }
        ],
        medicationCodeableConcept: {
          text: "Pimozide 2 MG Oral Tablet [Orap]",
          coding: [
            {
              display: "Pimozide 2 MG Oral Tablet [Orap]",
              system: "http://www.nlm.nih.gov/research/umls/rxnorm",
              code: this.state.medication,
            }
          ]
        },
        reasonCodeableConcept: {
          coding: [
            {
              system: "http://snomed.info/sct",
              code: this.state.treating,
            }
          ],
          text: "Alzheimer's disease"
        }

      };
      let request = {
        hookInstance: config.provider_hook_instance,
        fhirServer: config.fhir_url,
        hook:this.state.hook,
        // hook: 'liver-transplant',
        // fhirAuthorization : {
        //   "access_token" : this.state.token,
        //   "token_type" : config.token_type, // json
        //   "expires_in" : config.expires_in, // json
        //   "scope" : config.fhir_auth_scope,
        //   "subject" : config.fhir_auth_subject,
        // },
        userId : this.state.practitionerId,
        patientId: patientId ,
        context: {
          userId : this.state.practitionerId,
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
            ]
          }
        }
      };
      if(this.state.hook==='order-review')
      {
        // request.context.encounterId = this.state.encounterId,
        request.context.encounterId = this.state.encounterId
        request.context.orders.entry.push(coverage);
      }
      if(this.state.hook==='medication-prescribe'){
        request.context.orders.entry.push(medicationJson);
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

export default withRouter(ProviderRequest);