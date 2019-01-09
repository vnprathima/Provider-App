import React, {Component} from 'react';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import $ from 'jquery'; 
import simpleOauthModule from 'simple-oauth2';
import Client from 'fhir-kit-client';
import config from '../properties.json';
import DisplayBox from '../components/DisplayBox';
import Loader from 'react-loader-spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import Dropzone from 'react-dropzone';
import deepIterator from 'deep-iterator';

export default class Review extends Component {
  constructor(props){
    super(props);
    this.state = {
        code : queryString.parse(this.props.location.search, { ignoreQueryPrefix: true }).code,
        resourceJson : [],
        files : [],
        docs : [],
    }
    this.authorize();
    this.searchFHIR = this.searchFHIR.bind(this);
  }

   onDrop(files) {
    this.setState({ files });
  }
  onCancel() {
    this.setState({
      files: []
    });
  }
  getSettings() {
    var data = sessionStorage.getItem("app-settings");
    return JSON.parse(data);
  }
  
  async getClaimJson() {
    var patient_details='';
    var practitioner_details='';
    var procedure_details='';
    var fileInputData = {
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
      "payload": [],
      "note": this.state.additionalNotes,
    }
    if(this.state.resourceJson.length>0){
      for(var x=0;x<this.state.resourceJson.length;x++){
        if(this.state.resourceJson[x].hasOwnProperty('resourceType')){
          if(this.state.resourceJson[x].resourceType=='Patient'){
            patient_details = this.state.resourceJson[x]
          }
          else if(this.state.resourceJson[x].resourceType=='Practitioner'){
            practitioner_details=this.state.resourceJson[x]
          }
          else if(this.state.resourceJson[x].resourceType=='Procedure'){
            procedure_details=this.state.resourceJson[x]
          }
        }
      }
    }
    let request = {
      resourceType:'Claim',
      status:'draft',
      contained: [this.state.resourceJson
        
      ],
      patient: {
        reference: patient_details.resourceType+"/"+patient_details.id
      },
      provider:{
        reference: practitioner_details+"/"+practitioner_details.id
      },
      procedure: procedure_details,
      use:"claim",
      type:{
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/claim-type",
            code: "institutional"
          }
        ]
      },
    };    
    if(this.state.files !=null){
      for(var i=0;i<this.state.files.length;i++){
        (function(file) {
          let content_type = file.type;
          let file_name = file.name;
          var reader = new FileReader();  
          reader.onload = function(e) {  
              // get file content  
              fileInputData.payload.push({
                  "contentAttachment": {
                    "data": reader.result,
                    "contentType": content_type,
                    "title": file_name,
                    "language": "en"
                  }})
          }
          reader.readAsBinaryString(file);
        })(this.state.files[i])
      }
    }

    request.contained[0].push(fileInputData)
    return request;
  }

async createFhirResource() {
    let claim_json = await this.getClaimJson();
    var settings = this.getSettings();
    const fhirClient = new Client({ baseUrl: settings.api_server_uri });
    var { authorizeUrl, tokenUrl } = await fhirClient.smartAuthMetadata();
    authorizeUrl = {protocol:"https://",host:"54.227.173.76:8443/",pathname:"auth/realms/ClientFhirServer/protocol/openid-connect/auth"}
      tokenUrl = {protocol:"https://",host:"54.227.173.76:8443/",pathname:"auth/realms/ClientFhirServer/protocol/openid-connect/token"}
    const oauth2 = simpleOauthModule.create({
        client: {
            id: config.client
        },
        auth: {
            tokenHost: `${tokenUrl.protocol}//${tokenUrl.host}`,
            tokenPath: tokenUrl.pathname,
            authorizeHost: `${authorizeUrl.protocol}//${authorizeUrl.host}`,
            authorizePath: authorizeUrl.pathname,
        },
    });
    const options = {code : this.state.code};
    try {
        const result = await oauth2.authorizationCode.getToken(options);
        const { token } = oauth2.accessToken.create(result);
        console.log('The token is : ', token);
        fhirClient.bearerToken = token.access_token;
        fhirClient.create({
            resourceType: 'Claim',
            body: claim_json,
        }).then((data) => { console.log(data); });
    } catch (error) {
        console.error('Unable to create claim', error.message);
        console.log('Claim Creation failed');
    }
    
  }

    async searchFHIR(fhirClient, resourceType, searchStr) {
        var resourceJson = this.state.resourceJson;
        let searchResponse = await fhirClient.search({ resourceType: resourceType, searchParams: searchStr })
        console.log(searchResponse);

        if(searchResponse['total'] > 0){
            resourceJson.push(searchResponse)
            this.setState({resourceJson: resourceJson});
            console.log("Resource json---",this.state.resourceJson);
        }
    }

    async readFHIR(fhirClient, resourceType, resourceId) {
        var resourceJson = this.state.resourceJson;
        let readResponse = await fhirClient.read({ resourceType: resourceType, id: resourceId });
        resourceJson.push(readResponse)
        this.setState({resourceJson: resourceJson});
        console.log("Resource json---",this.state.resourceJson);
    }

  async authorize() {
    var settings = this.getSettings();
    const fhirClient = new Client({ baseUrl: settings.api_server_uri });
    var { authorizeUrl, tokenUrl } = await fhirClient.smartAuthMetadata();
    authorizeUrl = {protocol:"https://",host:"54.227.173.76:8443/",pathname:"auth/realms/ClientFhirServer/protocol/openid-connect/auth"};
    tokenUrl = {protocol:"https://",host:"",pathname:"auth/realms/ClientFhirServer/protocol/openid-connect/token"};
    const oauth2 = simpleOauthModule.create({
        client: {
        id: settings.client_id
        },
        auth: {
        // tokenHost: `${tokenUrl.protocol}//${tokenUrl.host}`,
        tokenHost: "https://54.227.173.76:8443/",
        tokenPath: tokenUrl.pathname,
        authorizeHost: `${authorizeUrl.protocol}//${authorizeUrl.host}`,
        authorizePath: authorizeUrl.pathname,
        },
    });
    const options = {code : this.state.code};
    try {
        const result = await oauth2.authorizationCode.getToken(options);
        const { token } = oauth2.accessToken.create(result);
        sessionStorage.getItem("tokenResponse",token.access_token);
        console.log('The token is : ', token);
        fhirClient.bearerToken = token.access_token;
        const url = config.crd_url + "smart_app";
        console.log("fetching data from "+url)
        var self = this;
        fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            'appContext':settings.launch_id,
        }),
        }, Promise.resolve()).then((response) => {
            return response.json();
        }).then((response) => {
            var resourceJson = [];
            console.log("appData-----",response[0].appData);
            Object.keys(response[0].appData).forEach(function(key) {
                var val = response[0].appData[key]
                console.log("Key-----",key,"value---",val);
                if (key === 'patientId'){
                    key = 'Patient'
                    // val = 'c8e705a6-2a35-4d63-82ec-59301842d79d'
                }
                if (val !== ''){
                    self.readFHIR(fhirClient,key,val);
                }
            });
            var docs = [];
            response[0].requirements.map((i,req)=>{
                console.log("Requirement-----",req);
                if (req == 0){
                    Object.keys(response[0].requirements[req]).forEach(function(res_type) {
                        var code = response[0].requirements[req][res_type]['codes'][0]['code'];
                        if (res_type !== 'EpisodeOfCare' && res_type !== 'Location'){
                            self.searchFHIR(fhirClient,res_type,"code="+code);
                        }
                    });
                } else {
                    docs.push(response[0].requirements[req]);
                    this.setState({docs:docs});
                }
                
            })
            
        })
    } catch (error) {
        console.error('Access Token Error', error.message);
        console.log('Authentication failed');
    }
  }

  hasAuthToken() {
    return sessionStorage.getItem("tokenResponse") !== undefined;
  }
  refreshApp() {
    withRouter(({ history }) => (history.push('/')))
  }

  renderObject(inputObj) {
    const it = deepIterator(inputObj);
      for (let {parent, key} of it) {
        console.log(parent,key,'parent:key');
      }
    return (
      <div>
        {Object.keys(inputObj).map((key, i) =>{
            if (typeof(inputObj[key]) == "string" && key != "id" && key != "resourceType"){
              return(
                <div key={i}>
                  <div className="left-col">{key}</div>
                  <div className="right-col">{inputObj[key]}</div>
                </div>)
            }
            if (typeof(inputObj[key]) == "object" && key != "id" && key != "resourceType"){
              console.log("recursive---------------",inputObj[key], "---------", key);
               this.renderObject(inputObj[key])

        
            }
          })}
      </div>
    )
  }
  renderPage(){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
       const files = this.state.files.map(file => (
            <div className='file-block' key={file.name}>
                <a onClick={() => this.onRemove(file)} className="close-thik"></a>
                {file.name}
            </div>
        ))
        console.log(this.state.resourceJson,'this is resource json')
        const resourceData = this.state.resourceJson.map((res, index) => {
            if(res.hasOwnProperty('resourceType')){
                return (
                    <div key={index}>
                    <div className="header">{res.resourceType}</div>
                    {this.renderObject(res)}
                    </div>);
            }
        });
       if (! this.hasAuthToken()) {
            if (this.state.code) {
                this.authorize();
            } else {
                return(
                    <div>
                        <div>Not yet authorized</div>
                        <div><input type="submit" value="Sign In" onClick={this.authorize}/></div>
                    </div>
                )
            }
       } else {
           return (
                <React.Fragment>
                    <div>
                    <div className="main_heading">HEALTH INSURANCE CLAIM SUBMIT</div>
                    <div className="content">
                        <div className="left-form">
                        {resourceData}  
                        </div>
                        <div className="right-form">
                        <div className="header">
                            Upload Required/Additional Documentation
                            </div>
                        <span>
                        </span>
                        <div className="">
                            <div className="left-col">Required Documents</div>
                            <div className="right-col">{this.state.docs.join(', ')}</div>
                        </div>
                        <div className="drop-box">
                        <section>
                            <Dropzone 
                                onDrop={this.onDrop.bind(this)}
                                onFileDialogCancel={this.onCancel.bind(this)
                                }
                            >
                                {({getRootProps, getInputProps}) => (
                                <div    >
                                <div className='drag-drop-box' {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <div className="file-upload-icon"><FontAwesomeIcon icon={faCloudUploadAlt}/></div>
                                    <div>Drop files here, or click to select files </div> 
                                </div>
                                </div>
                                )}
                            </Dropzone>

                            </section>
                            <div  >{files}</div>
                        </div>
                        <div className="header">
                            Additional Notes
                        </div>
                        <div className="docs">
                            <textarea name="myNotes"  value={this.state.additionalNotes} onChange={this.onNotesChange} rows="10" cols="83" />
                        </div>

                        <button className="submit-btn btn btn-class button-ready" onClick={this.createFhirResource}>Submit
                        <div id="fse" className={"spinner " + (this.state.loading ? "visible" : "invisible")}>
                            <Loader
                            type="Oval"
                            color="#222222"
                            height="16"
                            width="16"
                            />
                        </div>
                        </button>
                        <div >
                                    <DisplayBox
                                    response = {this.state.response} req_type="coverage_determination" />
                                </div>
                        </div>

                    </div>
                    </div>
                </React.Fragment>);
       }
  }
  render() {
    return (
      <div className="attributes mdl-grid">
         {this.renderPage()}
      </div>)
  }
}