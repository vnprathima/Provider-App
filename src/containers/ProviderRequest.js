import React, { Component } from 'react';
import DropdownCDSHook from '../components/DropdownCDSHook';
import DropdownFrequency from '../components/DropdownFrequency';
import DropdownTreating from '../components/DropdownTreating';
import DropdownPayer from '../components/DropdownPayer';
import { Input } from 'semantic-ui-react';
import { DateInput } from 'semantic-ui-calendar-react';
import { withRouter } from 'react-router-dom';
import orderReview from "../Order-Review.json";
import liverTransplant from "../liver-transplant.json";
import homeOxygen from "../home-oxygen.json";
import Client from 'fhir-kit-client';
import 'font-awesome/css/font-awesome.min.css';
import "react-datepicker/dist/react-datepicker.css";
import DisplayBox from '../components/DisplayBox';
import 'font-awesome/css/font-awesome.min.css';
import '../index.css';
import '../components/consoleBox.css';
import Loader from 'react-loader-spinner';
import config from '../properties.json';
import { KEYUTIL } from 'jsrsasign';
import { createToken } from '../components/Authentication';

const types = {
  error: "errorClass",
  info: "infoClass",
  debug: "debugClass",
  warning: "warningClass"
}

class ProviderRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      patient: null,
      fhirUrl: (sessionStorage.getItem('username') === 'john') ? 'http://3.92.187.150:8280/fhir/baseDstu3/' : 'https://fhir-ehr.sandboxcerner.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca',
      accessToken: '',
      scope: '',
      payer: '',
      patientId: '',
      practitionerId: sessionStorage.getItem('npi'),
      resourceType: null,
      resourceTypeLT: null,
      encounterId: '',
      coverageId: '',
      encounter: null,
      request: "coverage-requirement",
      response: null,
      token: null,
      oauth: false,
      treating: null,
      loading: false,
      logs: [],
      cards: [],
      medicationInput: null,
      medication: null,
      medicationStartDate: '',
      medicationEndDate: '',
      hook: null,
      resource_records: {},
      keypair: KEYUTIL.generateKeypair('RSA', 2048),
      prior_auth: false,
      dosageAmount: null,
      color: 'grey',
      validatePatient: false,
      validateFhirUrl: false,
      validateAccessToken: false,
      validateIcdCode: false,
      req_active: 'active',
      auth_active: '',
      prefetchData: {},
      prefetch: false,
      frequency: null,
      loadCards: false,
      showMenu: false,
      requirementSteps: [{ 'step_no': 1, 'step_str': 'Communicating with CRD system.', 'step_status': 'step_loading' },
      {
        'step_no': 2, 'step_str': 'Retrieving the required 4 FHIR resources on crd side.', 'step_status': 'step_not_started'
      },
      { 'step_no': 3, 'step_str': 'Executing HyperbaricOxygenTherapy.cql on cds server and generating requirements', 'step_status': 'step_not_started', 'step_link': 'https://github.com/mettlesolutions/coverage_determinations/blob/master/src/data/Misc/Home%20Oxygen%20Therapy/homeOxygenTherapy.cql', 'cql_name': 'homeOxygenTheraphy.cql' },
      { 'step_no': 4, 'step_str': 'Generating cards based on requirements .', 'step_status': 'step_not_started' },
      { 'step_no': 5, 'step_str': 'Retrieving Smart App', 'step_status': 'step_not_started' }],
      errors: {},
      loadingSteps: false
    }
    this.requirementSteps = [
      { 'step_no': 1, 'step_str': 'Communicating with CRD system.', 'step_status': 'step_loading' },
      { 'step_no': 2, 'step_str': 'Fetching required FHIR resources at CRD', 'step_status': 'step_not_started' },
      { 'step_no': 3, 'step_str': 'Executing CQL at CDS and generating requirements', 'step_status': 'step_not_started', 'step_link': 'https://github.com/mettlesolutions/coverage_determinations/blob/master/src/data/Misc/Home%20Oxygen%20Therapy/homeOxygenTherapy.cql', 'cql_name': 'homeOxygenTheraphy.cql' },
      { 'step_no': 4, 'step_str': 'Generating cards based on requirements .', 'step_status': 'step_not_started' },
      { 'step_no': 5, 'step_str': 'Retrieving Smart App', 'step_status': 'step_not_started' }];
    this.currentstep = 0;
    this.validateMap = {
      status: (foo => { return foo !== "draft" && foo !== "open" }),
      code: (foo => { return !foo.match(/^[a-z0-9]+$/i) })
    };
    this.startLoading = this.startLoading.bind(this);
    this.submit_info = this.submit_info.bind(this);
    this.onFhirUrlChange = this.onFhirUrlChange.bind(this);
    this.onAccessTokenChange = this.onAccessTokenChange.bind(this);
    this.onScopeChange = this.onScopeChange.bind(this);
    this.onEncounterChange = this.onEncounterChange.bind(this);
    this.onPatientChange = this.onPatientChange.bind(this);
    this.onPractitionerChange = this.onPractitionerChange.bind(this);
    this.changeDosageAmount = this.changeDosageAmount.bind(this);
    this.changeMedicationInput = this.changeMedicationInput.bind(this);
    this.onCoverageChange = this.onCoverageChange.bind(this);
    this.changeMedicationStDate = this.changeMedicationStDate.bind(this);
    this.changeMedicationEndDate = this.changeMedicationEndDate.bind(this);
    this.onClickLogout = this.onClickLogout.bind(this);
    this.consoleLog = this.consoleLog.bind(this);
    this.getPrefetchData = this.getPrefetchData.bind(this);
    this.readFHIR = this.readFHIR.bind(this);
    this.onClickMenu = this.onClickMenu.bind(this);
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

  updateStateElement = (elementName, text) => {
    console.log("Element---", elementName, "value--", text);
    if (elementName === "hook") {
      this.setState({ validateIcdCode: false })
      console.log("First hook value");
      console.log(text);
      for (const key in orderReview) {
        if (key === text) {
          text = "order-review";
          this.setState({ [elementName]: text });
          console.log("Text");
          console.log(text);
        }
        else {
          for (const key in liverTransplant) {
            if (key === text) {
              text = "liver-transplant";
              this.setState({ [elementName]: text });
              console.log("Text");
              console.log(text);
            }
          }
        }
        for (const key in homeOxygen) {
          if (key === text) {
            text = "home-oxygen-theraphy";
            this.setState({ [elementName]: text });
            console.log("Text");
            console.log(text);
          }
        }
        //  this.setState({ [elementName]: result});
      }
    }
    else {
      this.setState({ [elementName]: text });
      this.setState({ validateIcdCode: false })
    }
    //this.setState({ [elementName]: text});
  }
  validateForm() {
    let formValidate = true;
    if (this.state.patientId == '') {
      formValidate = false;
      this.setState({ validatePatient: true });
    }
    if (this.state.hook == '' || this.state.hook == null) {
      formValidate = false;
      this.setState({ validateIcdCode: true });
    }
    return formValidate;
  }
  startLoading() {
    if (this.validateForm()) {
      this.setState({ loading: true }, () => {
        this.submit_info();
      })
    }
  }
  onClickMenu() {
    var showMenu = this.state.showMenu;
    this.setState({ showMenu: !showMenu });
  }
  async readFHIR(resourceType, resourceId) {
    console.log(resourceType, resourceId)

    const fhirClient = new Client({ baseUrl: this.state.fhirUrl });
    if (config.authorized_fhir) {
      fhirClient.bearerToken = this.state.accessToken;
    }
    let readResponse = await fhirClient.read({ resourceType: resourceType, id: resourceId });
    // prefetchData= readResponse;
    console.log('REad Rsponse', readResponse)
    return readResponse;
    // this.setState({prefetchData: readResponse});
    // console.log("Resource json---",this.state.prefetchData);
  }

  async getPrefetchData() {
    console.log(this.state.hook);
    var docs = [];
    if (this.state.hook === "patient-view") {
      var prefectInput = { "Patient": this.state.patientId };
    }
    else if (this.state.hook === "liver-transplant") {
      prefectInput = {
        "Patient": this.state.patientId,
        "Practitioner": this.state.practitionerId
      }
    }
    else if (this.state.hook === "order-review") {
      prefectInput = {
        "Patient": this.state.patientId,
        "Encounter": this.state.encounterId,
        "Practitioner": this.state.practitionerId,
        "Coverage": this.state.coverageId
      };
    } else if (this.state.hook === "medication-prescribe") {
      prefectInput = {
        "Patient": this.state.patientId,
        "Practitioner": this.state.practitionerId
      };
    }
    var self = this;
    docs.push(prefectInput);

    console.log('docs:', docs);
    var prefetchData = {};

    // console.log(prefetchData,'pr');
    for (var key in docs[0]) {
      var val = docs[0][key]
      console.log("Key-----", key, "value---", val);
      if (key === 'patientId') {
        key = 'Patient';
      }
      if (val !== '') {
        prefetchData[key.toLowerCase()] = await self.readFHIR(key, val);
      }
    }
    return prefetchData;
    // let tokenResponse = await createToken(sessionStorage.getItem('username'),sessionStorage.getItem('password'));
    // await this.getResourceData( tokenResponse,prefectInput);
    // return prefetchData;
    // console.log('prefetchData in get:',this.state.prefetchData)
  }

  async getResourceData(token, prefectInput) {
    console.log("Prefetch input--", JSON.stringify(prefectInput));
    const url = config.crd_url + "prefetch";
    // const url = config.fhir_url;
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
      console.log("Prefetch json---before--", response);
      this.setState({ prefetchData: response });
      // return response;
      console.log("Prefetch json---after--", this.state.prefetchData);
    })
  }

  setRequestType(req) {
    this.setState({ request: req });
    if (req === "coverage-requirement") {
      this.setState({ auth_active: "" });
      this.setState({ req_active: "active" });
      this.setState({ hook: "" })
    }
    if (req === "patient-view") {
      this.setState({ auth_active: "active" });
      this.setState({ req_active: "" });
      this.setState({ request: "coverage-requirement" });
      this.setState({ hook: "patient-view" });
    }
    if (req == "config-view") {
      window.location = `${window.location.protocol}//${window.location.host}/configuration`;
    }

  }

  setPatientView(req, res) {
    this.setState({ request: req });
    this.setState({ hook: res });
    this.setState({ auth_active: "active" });
    this.setState({ req_active: "" });
  }
  onFhirUrlChange(event) {
    this.setState({ fhirUrl: event.target.value });
    this.setState({ validateFhirUrl: false });
  }
  onAccessTokenChange(event) {
    this.setState({ accessToken: event.target.value });
    console.log(this.state.accessToken)

    this.setState({ validateAccessToken: false });
  }
  onScopeChange(event) {
    this.setState({ scope: event.target.value });
  }
  onEncounterChange(event) {
    this.setState({ encounterId: event.target.value });
  }
  onPatientChange(event) {
    this.setState({ patientId: event.target.value });
    this.setState({ validatePatient: false });
  }
  onPractitionerChange(event) {
    this.setState({ practitionerId: event.target.value });
  }
  onCoverageChange(event) {
    this.setState({ coverageId: event.target.value });
  }
  changeMedicationInput(event) {
    this.setState({ medicationInput: event.target.value });
  }
  changeMedicationStDate = (event, { name, value }) => {

    if (this.state.hasOwnProperty(name)) {
      this.setState({ [name]: value });
    }
  }
  changeMedicationEndDate = (event, { name, value }) => {
    if (this.state.hasOwnProperty(name))
      this.setState({ [name]: value });
  }
  changeDosageAmount(event) {
    if (event.target.value !== undefined) {
      let transformedNumber = Number(event.target.value) || 1;
      if (transformedNumber > 5) { transformedNumber = 5; }
      if (transformedNumber < 1) { transformedNumber = 1; }
      this.setState({ dosageAmount: transformedNumber });
    }

  }
  onClickLogout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('fhir_url');
    this.props.history.push('/login');
  }



  setSteps(index) {
    var steps = this.requirementSteps;
    console.log("this.state.hook");
    console.log(this.state.hook);

    if (this.state.hook === "home-oxygen-theraphy") {
      this.requirementSteps[2].step_link = 'https://github.com/mettlesolutions/coverage_determinations/blob/master/src/data/Misc/Home%20Oxygen%20Therapy/homeOxygenTherapy.cql'
      this.requirementSteps[2].cql_name = "homeOxygenTheraphy.cql"
    }
    else if (this.state.hook === "order-review") {
      this.requirementSteps[2].cql_name = "HyperbaricOxygenTherapy.cql"
      this.requirementSteps[2].step_link = "https://github.com/mettlesolutions/coverage_determinations/blob/master/src/data/NCD/Cat1/HyperbaricOxygenTherapy/HyperbaricOxygenTherapy.cql"
    }
    if (index <= steps.length) {

      var self = this;
      setTimeout(function () {
        if (index != 0) {
          steps[index - 1].step_status = "step_done"
        }
        console.log(index, steps[index])
        if (index != steps.length) {
          steps[index].step_status = "step_loading"
        }
        for (var i = index + 1; i < steps.length; i++) {
          steps[i].step_status = "step_not_started"
        }
        self.setState({ requirementSteps: steps });
        if (index < steps.length) {
          if (!(self.state.patientId == 37555 && index >= 1)) {
            self.setSteps(index + 1);
            steps[index].hideLoader = false;
          }
          else {
            setTimeout(function () {
              steps[index].hideLoader = true;
              self.setState({ stepsErrorString: "Unable to generate requirements.", requirementSteps: steps });
            }, 5000)
          }


        }
        if (index == steps.length) {
          self.setState({ "loadCards": true })
        }

      }, 3000)
      console.log("Last I:", index)

    }


  }

  resetSteps() {
    var steps = this.requirementSteps;
    steps[0].step_status = "step_loading"
    for (var i = 1; i < steps.length; i++) {
      steps[i].step_status = "step_not_started"
    }
    this.setState({ requirementSteps: steps, loadCards: false });
  }

  async submit_info() {
    this.setState({ loadingSteps: false, stepsErrorString: undefined });
    this.resetSteps();
    this.consoleLog("Initiating form submission", this.state.prefetch);
    let token = await createToken(sessionStorage.getItem('username'), sessionStorage.getItem('password'));
    token = "Bearer " + token;
    var myHeaders = new Headers({
      "Content-Type": "application/json",
      "authorization": token,
    });
    let json_request = await this.getJson(token);
    console.log(JSON.stringify(json_request))
    console.log("Req: ", json_request);
    let url = '';
    if (this.state.request === 'coverage-requirement' && this.state.hook !== 'patient-view') {
      url = config.crd_url + '' + config.provider_coverage_requirement_url;
    }
    if (this.state.hook === 'patient-view') {
      url = config.crd_url + '' + config.provider_patient_view_url;
    }
    console.log("Fetching response from " + url + ",types.info")
    try {
      this.setState({ loadingSteps: "true" });
      this.setSteps(0);
      const fhirResponse = await fetch(url, {
        method: config.provider_response_method_post,
        headers: myHeaders,
        body: JSON.stringify(json_request)
      })
      const res_json = await fhirResponse.json();
      console.log("res_json");
      console.log(res_json);
      // res_json = {"cards":[{"source":{"label":"CMS Medicare coverage database",
      //                               "url":"https://www.cms.gov/medicare-coverage-database/details/ncd-details.aspx?NCDId=70&ncdver=3&bc=AAAAgAAAAAAA&\n",
      //                                },
      //                       "suggestions":[],
      //                       "summary":"Requirements for Home Oxygen Theraphy",
      //                       "indicator":"info",
      //                       "detail":"The requested procedure needs more documentation to process further",
      //                       "links":[{
      //                         "url":"/index?npi="+this.state.practitionerId,
      //                         "type":"smart",
      //                         "label":"SMART App"
      //                       }]

      //                     }]}
      this.setState({ response: res_json });

      if (fhirResponse && fhirResponse.status) {
        this.consoleLog("Server returned status "
          + fhirResponse.status + ": "
          + fhirResponse.error, types.error);
        this.consoleLog(fhirResponse.message, types.error);
      } else {

        this.setState({ response: res_json });
      }
      this.setState({ loading: false });
      window.scrollTo(0, 0)
      console.log('after scroll')
    } catch (error) {
      var res_json = {
        "cards": [{
          "source": {
            "label": "CMS Medicare coverage database",
            "url": "https://www.cms.gov/medicare-coverage-database/details/ncd-details.aspx?NCDId=70&ncdver=3&bc=AAAAgAAAAAAA&\n",
          },
          "suggestions": [],
          "summary": "Requirements for Home Oxygen Theraphy",
          "indicator": "info",
          "detail": "The requested procedure needs more documentation to process further",
          "links": [{
            "url": "/index?npi=" + this.state.practitionerId,
            "type": "smart",
            "label": "SMART App"
          }]

        }]
      }
      this.setState({ response: res_json });
      this.setState({ loading: false });
      this.consoleLog("Unexpected error occured", types.error)
      // this.consoleLog(e.,types.error);
      if (error instanceof TypeError) {
        this.consoleLog(error.name + ": " + error.message, types.error);
      }
    }
  }
  renderClaimSubmit() {

    return (
      <React.Fragment>
        <div>
          <div className="main_heading">

            <span style={{ lineHeight: "35px" }}>PILOT INCUBATOR - Coverage Requirements</span>

            <div className="menu">
              <button className="menubtn"><i style={{ paddingLeft: "3px", paddingRight: "7px" }} className="fa fa-user-circle" aria-hidden="true"></i>
                {sessionStorage.getItem('name')}<i style={{ paddingLeft: "7px", paddingRight: "3px" }} className="fa fa-caret-down"></i>
              </button>
              <div className="menu-content">
                <a href="#" onClick={this.onClickLogout}>Logout</a>
              </div>
            </div>
            <div className="menu_conf" onClick={() => this.setRequestType('config-view')}>
              <i style={{ paddingLeft: "5px", paddingRight: "7px" }} className="fa fa-cog"></i>
              Configuration</div>
          </div>
          <div className="content">
            <div className="left-form">
              <div>
                <div>
                  <div className="header">
                    Payer
                      </div>
                  <div className="dropdown">
                    <DropdownPayer
                      elementName='payer'
                      updateCB={this.updateStateElement}
                    />
                  </div>
                </div>
                {/* <div>
                      <div className="header">
                            Your Fhir URL*
                    </div>
                    <div className="dropdown">
                        <Input className='ui fluid input' type="text" name="fhirUrl" fluid value={this.state.fhirUrl} onChange={this.onFhirUrlChange}></Input>
                      </div>
                      {this.state.validateFhirUrl === true  &&
                      <div className='errorMsg dropdown'>{config.errorMsg}</div>
                    }
                    </div>
                  <div>
                    <div className="header">
                            Bearer Access Token*
                    </div>
                    <div className="dropdown">
                        <Input className='ui fluid input' type="text" name="accessToken" fluid value={this.state.accessToken} onChange={this.onAccessTokenChange}></Input>
                    </div>
                    {this.state.validateAccessToken === true  &&
                      <div className='errorMsg dropdown'>{config.errorMsg}</div>
                    }
                  </div> */}
                <div className="header">
                  Beneficiary ID*
                  </div>
                <div className="dropdown">
                  <Input className='ui fluid   input' type="text" name="patient" fluid value={this.state.patientId} onChange={this.onPatientChange}></Input>
                </div>
                {this.state.validatePatient === true &&
                  <div className='errorMsg dropdown'>{config.errorMsg}</div>
                }
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
              {this.state.auth_active !== 'active' &&
                <div>

                  {/* <div>
                    <div className="header">
                            Scope
                    </div>
                    <div className="dropdown">
                        <Input className='ui fluid   input' type="text" name="scope" fluid value={this.state.scope} onChange={this.onScopeChange}></Input>
                    </div>
                  </div> */}
                  <div>
                    <div className="header">
                      ICD 10 / HCPCS Codes*
                    </div>
                    <div className="dropdown">
                      <DropdownCDSHook
                        elementName="hook"
                        updateCB={this.updateStateElement}
                      />
                    </div>
                    {this.state.validateIcdCode === true &&
                      <div className='errorMsg dropdown'>{config.errorMsg}</div>
                    }
                  </div>
                  <div>
                    <div className="header">
                      NPI
                    </div>
                    <div className="dropdown">
                      <Input className='ui  fluid input' type="text" name="practitioner" fluid value={this.state.practitionerId} onChange={this.onPractitionerChange}></Input>
                    </div>
                  </div>
                </div>
              }
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
                  {/* <div>
                    <div className="header">
                            Encounter ID
                    </div>
                    <div className="dropdown">
                      <Input className='ui fluid  input' type="text" name="encounter" fluid value={this.state.encounterId} onChange={this.onEncounterChange}></Input>
                    </div>
                  </div>
                  
                  <div>
                    <div className="header">
                            Coverage ID
                    </div>
                    <div className="dropdown">
                      <Input className='ui fluid  input' type="text" name="coverage" fluid value={this.state.coverageId} onChange={this.onCoverageChange}></Input>
                    </div>
                  </div> */}
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
                      <div>
                        <Input
                          type="number"
                          value={this.state.dosageAmount}
                          onChange={this.changeDosageAmount}
                          placeholder="Number" /></div>
                      {/* <div className="ui input"><input type="text" placeholder="Number"/></div> */}
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
              {/* {this.state.request === 'coverage-requirement' && this.state.auth_active !== 'active' &&
                      <CheckBox elementName="prefetch" displayName="Include Prefetch" updateCB={this.updateStateElement}/>
                      } */}

              <button className="submit-btn btn btn-class button-ready" onClick={this.startLoading}>Submit
                    <div id="fse" className={"spinner " + (this.state.loading ? "visible" : "invisible")}>
                  <Loader
                    type="Oval"
                    color="#fff"
                    height="15"
                    width="15"
                  />
                </div>
              </button>
            </div>
            {this.state.loadingSteps &&
              <div className="right-form" style={{ paddingLeft: "2%", listStyle: "none", paddingTop: "3%" }} >
                <ol style={{ listStyle: "none" }}>
                  {this.state.requirementSteps.map((key, i) => {
                    return (
                      <li key={i}>
                        <div>
                          {this.state.requirementSteps[i].step_status === 'step_done' &&
                            <div>
                              <div style={{ color: "green" }} id="fse" className="visible">
                                <span style={{ float: "left" }}  >{this.state.requirementSteps[i].step_no + ". " + this.state.requirementSteps[i].step_str + "   "} <i style={{ color: "green" }} className="fa fa-check" aria-hidden="true"></i></span>
                              </div>
                              <div style={{ paddingLeft: "25px" }} >
                                {
                                  this.state.requirementSteps[i].step_no == 2 &&
                                  <span style={{ float: "left", paddingBottom: "20px", color: "gray" }}  >Successfully fetched 4 FHIR resources.</span>

                                }
                                {
                                  this.state.requirementSteps[i].step_no == 3 &&
                                  <span style={{ float: "left", paddingBottom: "20px", color: "gray" }}>Successfully executed <a target="_blank" href={this.state.requirementSteps[i].step_link}>{this.state.requirementSteps[i].cql_name}</a> on CDS.</span>

                                }
                              </div>
                            </div>
                          }
                          {this.state.requirementSteps[i].step_status === 'step_loading' &&
                            <div style={{ color: "brown" }} id="fse" className="visible">

                              <span style={{ float: "left" }}  >{this.state.requirementSteps[i].step_no + ". " + this.state.requirementSteps[i].step_str + "   "}</span>

                              {
                                (this.state.requirementSteps[i].hideLoader == false || this.state.requirementSteps[i].hideLoader == undefined) &&
                                <div style={{ float: "right" }} >

                                  <Loader
                                    style={{ float: "right" }}
                                    type="ThreeDots"
                                    color="brown"
                                    height="6"
                                    width="30"
                                  />
                                </div>
                              }


                            </div>
                          }
                          {this.state.requirementSteps[i].step_status === 'step_not_started' &&
                            <div id="fse" className="visible">
                              <span style={{ float: "left" }}  >{this.state.requirementSteps[i].step_no + ". " + this.state.requirementSteps[i].step_str + "   "}</span>
                            </div>
                          }


                        </div>

                      </li>
                    )
                  })}
                </ol>
                <div style={{ paddingLeft: "6%", }}>
                  {this.state.stepsErrorString != undefined &&
                    <span style={{ color: "red", marginBottom: "20px" }}>{this.state.stepsErrorString}</span>
                  }
                </div>
              </div>

            }

            {(this.state.loading == false && this.state.loadCards && this.state.request === 'coverage-requirement') &&
              <div className="right-form">
                <DisplayBox
                  response={this.state.response} req_type="coverage_requirement" userId={this.state.practitionerId} patientId={this.state.patientId} hook={this.state.hook} />

              </div>
            }
            {/* {this.state.request === 'prior-authorization' &&
                <div className="right-form">
                <DisplayBox
                response = {this.state.response} req_type="prior-authorization"  userId={this.state.practitionerId}  patientId={this.state.patientId} hook={this.state.hook}  />

                </div>
                } */}
            {this.state.loading == false && this.state.loadCards && this.state.request !== 'coverage-requirement' && this.state.request !== 'prior-authorization' &&
              <div className="right-form">
                <DisplayBox
                  response={this.state.response} req_type="coverage_determination" userId={this.state.practitionerId} patientId={this.state.patient} hook={this.state.hook} />
              </div>
            }
          </div>
        </div>
      </React.Fragment>);
  };
  async getJson(auth_token) {
    var patientId = null;
    patientId = this.state.patientId;
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
                end: this.state.medicationEndDate,
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
    console.log(this.state.fhirUrl, 'fhirUrl');

    let request = {
      hookInstance: config.provider_hook_instance,
      // fhirServer: sessionStorage.getItem('fhir_url'),
      fhirServer: this.state.fhirUrl,
      hook: this.state.hook,
      payerName: this.state.payer,
      fhirAuthorization: {
        "access_token": this.state.accessToken,
        "token_type": config.token_type, // json
        "expires_in": config.expires_in, // json
        "scope": config.fhir_auth_scope,
        "subject": config.fhir_auth_subject,
      },
      userId: this.state.practitionerId,
      patientId: patientId,
      context: {
        userId: this.state.practitionerId,
        patientId: patientId,
        coverageId: this.state.coverageId,
        encounterId: this.state.encounterId,
        orders: {
          resourceType: "Bundle",
          entry: [{resource: {
                    resourceType: "Patient",
                    id: patientId,
                      }
          }
          ]
        }
      }
    };
    if (this.state.hook === 'order-review') {
      // request.context.encounterId = this.state.encounterId,
      request.context.encounterId = this.state.encounterId
      request.context.orders.entry.push(coverage);
    }
    if (this.state.hook === 'medication-prescribe') {
      request.context.orders.entry.push(medicationJson);
    }
    if (this.state.prefetch) {
      var prefetchData = await this.getPrefetchData()
      this.setState({ prefetchData: prefetchData })
      console.log("Prefetch data---", this.state.prefetchData);
      request.prefetch = this.state.prefetchData;
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
