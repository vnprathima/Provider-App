import React, {Component} from 'react';

import InputBox from '../components/InputBox';

import DropdownPatient from '../components/DropdownPatient';
import DropdownCDSHook from '../components/DropdownCDSHook';
import DropdownEncounter from '../components/DropdownEncounter';
import DropdownInput from '../components/DropdownInput';
import DropdownResourceType from '../components/DropdownResourceType';
import '../index.css';
import '../components/consoleBox.css';
import Loader from 'react-loader-spinner';
import config from '../properties.json';
import KJUR, {KEYUTIL} from 'jsrsasign';


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
        encounterId:null,
        encounter:null,
        response:null,
        token: null,
        oauth:false,
        loading:false,
        logs:[],
        hook:null,
        keypair:KEYUTIL.generateKeypair('RSA',2048),
      errors: {},
    }
    this.validateMap={
      // age:(foo=>{return isNaN(foo)}),
      encounterId:(foo=>{return isNaN(foo)}),
      // gender:(foo=>{return foo!=="male" && foo!=="female"}),
      status:(foo=>{return foo!=="draft" && foo!=="open"}),
      code:(foo=>{return !foo.match(/^[a-z0-9]+$/i)})
  };
  // this.updateStateElement = this.updateStateElement.bind(this);
  this.startLoading = this.startLoading.bind(this);
  this.submit_info = this.submit_info.bind(this);
  this.consoleLog = this.consoleLog.bind(this);
  }
  makeid() {
    var text = [];
    var possible = "---ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 25; i++)
      text.push(possible.charAt(Math.floor(Math.random() * possible.length)));

    return text.join('');
  }

  async createJwt(){
    var pubKey = this.state.keypair.pubKeyObj;

    const jwkPrv2 = KEYUTIL.getJWKFromKey(this.state.keypair.prvKeyObj);
    const jwkPub2 = KEYUTIL.getJWKFromKey(this.state.keypair.pubKeyObj);
    console.log(pubKey);
    const currentTime = KJUR.jws.IntDate.get('now');
    const endTime = KJUR.jws.IntDate.get('now + 1day');
    const kid = KJUR.jws.JWS.getJWKthumbprint(jwkPub2)
    // const pubPem = {"pem":KEYUTIL.getPEM(pubKey),"id":kid};
    const pubPem = {"pem":jwkPub2,"id":kid};

    // Check if the public key is already in the dbs
    const checkForPublic = await fetch("http://localhost:3001/public_keys?id="+kid,{
      "headers":{
        "Content-Type":"application/json"
      },
      "method":"GET"
    }).then(response => {return response.json()});
    if(!checkForPublic.length){
      // POST key to db if it's not already there
      const alag = await fetch("http://localhost:3001/public_keys",{
        "body": JSON.stringify(pubPem),
        "headers":{
          "Content-Type":"application/json"
        },
        "method":"POST"
      });
    }
    const header = {
      "alg":"RS256",
      "typ":"JWT",
      "kid":kid,
      "jku":"http://localhost:3001/public_keys"
    };
    const body = {
      "iss":"localhost:3000",
      "aud":"r4/order-review-services",
      "iat": currentTime,
      "exp": endTime,
      "jti": this.makeid()
    }

    var sJWT = KJUR.jws.JWS.sign("RS256",JSON.stringify(header),JSON.stringify(body),jwkPrv2)

    return sJWT;
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
  console.log("Req: ",json_request);
  
  var auth = 'Basic ' + new Buffer('john' + ':' + 'john123').toString('base64');
  var myHeaders = new Headers({
    "Content-Type": "application/json",
    "authorization": auth,
  });
        this.consoleLog("Fetching response from http://54.227.173.76:8090/r4/cds-services/order-review-crd/",types.info)
      try{
        const fhirResponse= await fetch("http://54.227.173.76:8090/r4/cds-services/order-review-crd",{
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(json_request)
        }).then(response => {
          this.consoleLog("Recieved response",types.info);
            return response.json();
        }).catch(reason => this.consoleLog("No response recieved from the server", types.error));

        if(fhirResponse && fhirResponse.status){
          console.log(fhirResponse);
          this.consoleLog("Server returned status "
                          + fhirResponse.status + ": "
                          + fhirResponse.error,types.error);
          this.consoleLog(fhirResponse.message,types.error);
        }else{
          this.setState({response: fhirResponse});
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
                  <DropdownResourceType
                    elementName="resourceType"
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
            
            <button className={"submit-btn btn btn-class "+ (!total ? "button-error" : total===1 ? "button-ready":"button-empty-fields")} onClick={this.startLoading}>Submit
              </button>
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
         console.log(patientId,'sdfghhhhhj')
      }
      else{
        this.consoleLog("No© client id provided in properties.json",this.warning);
      }

      let request = {
        hookInstance: "d1577c69-dfbe-44ad-ba6d-3e05e953b2ea",
        fhirServer: "http://54.227.173.76:8090/",        
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
          encounterId: this.state.encounter, // select
          orders: {
            resourceType: "Bundle",
            entry: [
              {
                resource: {
                  resourceType: this.state.resourceType,  // select
                  id: "4952",
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
      return request;
    }
  render() {
    return (
      <div className="attributes mdl-grid">
          {this.renderClaimSubmit()}
      </div>)
  }
}