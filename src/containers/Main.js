import React, { Component } from 'react';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
//import $ from 'jquery'; 
import simpleOauthModule from 'simple-oauth2';
import Client from 'fhir-kit-client';
import config from '../properties.json';
import DisplayBox from '../components/DisplayBox';
import Loader from 'react-loader-spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import Dropzone from 'react-dropzone';
import deepIterator from 'deep-iterator';
import { createToken } from '../components/Authentication';
import ReactJson from 'react-json-view'

var pascalcaseKeys = require('pascalcase-keys');

export default class Review extends Component {
    constructor(props) {
        super(props);
        this.state = {
            code: queryString.parse(this.props.location.search, { ignoreQueryPrefix: true }).code,
            resourceJson: [],
            files: [],
            docs: [],
            prior_authorization: '',
            claim_id: '',
            claimResponseJson:{},
            show_res: false,
            claimResponse: '',
            searchResponse:'',
            resourceDataJson:[],
            loading: false,
            token_error: false,
            claim_type : 'Claim',
        }
        console.log(this.state.code,'code',this.props.location.search)
        this.authorize();
        this.searchFHIR = this.searchFHIR.bind(this);
        this.onRemove=this.onRemove.bind(this);

        this.createFhirResource = this.createFhirResource.bind(this);
        this.reLaunch = this.reLaunch.bind(this);
        this.indexOfFile = this.indexOfFile.bind(this);
    }
    indexOfFile(file){
        for (var i = 0; i < this.state.files.length; i++) {
            console.log(this.state.files[i].name,file.name,'lets check')
            if (this.state.files[i].name == file.name ) {
                return i;
            }

        }
        return -1;
        
    }

    onDrop(files) {

        let new_files= [];

        new_files=this.state.files;
        // new_files.concat(this.state.files);
        // let old_files= this.state.files;
        for( var i = 0; i < files.length; i++){ 
            console.log(files[i],'what file', JSON.stringify(this.state.files).indexOf(JSON.stringify(files[i])), this.state.files)
            if ( this.indexOfFile(files[i]) == - 1 ) {
                console.log(this.indexOfFile(files[i]),i)
                new_files=this.state.files.concat(files);
            }
         }
        // if( this.state.files.every((value, index) => value !== files[index])){
        //     new_files= this.state.files.concat(files);
        //     console.log('includes')
        // }
        this.setState({ files:new_files });
        
    }
    onCancel(file) {
        let new_files = this.state.files;
        for( var i = 0; i < new_files.length; i++){ 
            if ( new_files[i] === file) {
                new_files.splice(i, 1); 
            }
         }
        this.setState({
            files: new_files
        });
    }
    onRemove(file){
        var new_files=this.state.files;
        for( var i = 0; i < new_files.length; i++){ 
          if ( new_files[i] === file) {
            new_files.splice(i, 1); 
          }
       }
        this.setState({files:new_files})
      }
    getSettings() {
        var data = sessionStorage.getItem("app-settings");
        return JSON.parse(data);
    }

    async getClaimJson() {
        var patient_details = '';
        var practitioner_details = '';
        var procedure_details = [];
        var condition_details=[];
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
        if (this.state.resourceJson.length > 0) {
            for (var x = 0; x < this.state.resourceJson.length; x++) {
                if (this.state.resourceJson[x].hasOwnProperty('resourceType')) {
                    if (this.state.resourceJson[x].resourceType === 'Patient') {
                        patient_details = this.state.resourceJson[x]
                    }
                    else if (this.state.resourceJson[x].resourceType === 'Practitioner') {
                        practitioner_details = this.state.resourceJson[x]
                    }
                    else if (this.state.resourceJson[x].resourceType === 'Procedure') {
                        procedure_details.push(this.state.resourceJson[x])
                    }
                    else if (this.state.resourceJson[x].resourceType === 'Condition') {
                        condition_details.push(this.state.resourceJson[x])
                    }

                }
            }
        }
        if (this.state.resourceDataJson.length > 0) {
            for (var x = 0; x < this.state.resourceDataJson.length; x++) {
                if (this.state.resourceDataJson[x].hasOwnProperty('resourceType')) {
                    if (this.state.resourceDataJson[x].resourceType === 'Patient') {
                        patient_details = this.state.resourceDataJson[x]
                    }
                }
            }
        }
        let procedure_sequence = 1;
        for(var key in procedure_details){
            procedure_details[key].sequence = procedure_sequence;
            procedure_sequence++;
        }
        let condition_sequence = 1;
        for(var key in condition_details){
            condition_details[key].sequence = condition_sequence;
            condition_sequence++;
        }
        console.log(condition_details,procedure_details,'condition_Details')
        
        var contained = this.state.resourceJson.concat(this.state.resourceDataJson);
        console.log("Contained--",contained);
        let request = {
            resourceType: 'Claim',
            status: 'draft',
            contained: contained,
            patient: {
                reference: "#" + patient_details.id
            },
            procedure: procedure_details,
            diagnosis: condition_details,
            use: { code: 'claim' },
            type: {
                coding: [
                    {
                        system: "http://terminology.hl7.org/CodeSystem/claim-type",
                        code: "institutional"
                    }
                ]
            },
        };
        if(this.state.prior_authorization){
            request.use.code = 'preauthorization';
        }
        console.log("practioner claim submit----" + practitioner_details);
        if (practitioner_details !== '' && practitioner_details.id !== undefined && practitioner_details.id !== null) {
            request['provider'] = {
                reference:"#" + practitioner_details.id
            }
        }
        if (this.state.files != null) {
            for (var i = 0; i < this.state.files.length; i++) {
                (function (file) {
                    let content_type = file.type;
                    let file_name = file.name;
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        // get file content  
                        fileInputData.payload.push({
                            "contentAttachment": {
                                "data": reader.result,
                                "contentType": content_type,
                                "title": file_name,
                                "language": "en"
                            }
                        })
                    }
                    reader.readAsBinaryString(file);
                })(this.state.files[i])
            }
        }
        console.log("Resource Json before communication--", this.state.resourceJson);
        request.contained.push(fileInputData);
        console.log('request:',request)
        console.log("Resource Json after communication--", this.state.resourceJson);
        return request;
    }

    async createFhirResource() {
        this.setState({loading:true});
        let claim_json = await this.getClaimJson();
        try {	
	        const fhirClient = new Client({ baseUrl: config.payer_fhir });
            const token = await createToken(sessionStorage.getItem('username'), sessionStorage.getItem('password'));
            console.log('The token is : ', token);
            fhirClient.bearerToken = token;
            fhirClient.create({
                resourceType: 'Claim',
                body: claim_json,
                headers: { "Content-Type": "application/fhir+json" }
            }).then((data) => {
                console.log(data);
                this.setState({claim_id : data.id});
                this.setState({ claimResponse: { success: true, "message": "Your " + this.state.claim_type + " has been submitted successfully with Reference Id - Claim/" + data.id } });
                this.setState({loading:false});
            }).catch((err) => {
                console.log(err);
                this.setState({ claimResponse: { success: false, "message": "Failed to create " + this.state.claim_type + "." } });
                this.setState({loading:false});
            })
        } catch (error) {
            console.error('Unable to create claim', error.message);
            console.log('Claim Creation failed');
            this.setState({ claimResponse: { success: false, "message": "Failed to create " + this.state.claim_type + "." } });
            this.setState({loading:false});
        }

    }

    async searchFHIR(fhirClient, resourceType, searchStr,type) {
        console.log(resourceType,searchStr)
        var resourceJson = this.state.resourceJson;
        let searchResponse = await fhirClient.search({ resourceType: resourceType, searchParams: searchStr })

        if (searchResponse['total'] > 0) {
            searchResponse.entry.map((resrc, j) => {
                console.log("Search response --- ", resrc, j);
                if(type =='provider'){
                    resourceJson.push(resrc['resource']);
                    this.setState({ resourceJson: resourceJson });
                }
                else if(type == 'payer'){
                    this.setState({claimResponseJson:resrc});
                    this.setState({show_res : true});
                }
                console.log("Resource json---", this.state.resourceJson);
            });
            this.setState({searchResponse:''});
        }
        else if(searchResponse['total'] == 0 && type === 'payer'){
            console.log("claimresjson---",this.state.claimResponseJson.length);
            this.setState({show_res : true});
            this.setState({searchResponse:"It Seems like the " + this.state.claim_type + "  has not been processed yet. Please try agian after some time !!"})
        }
    }

    async readFHIR(fhirClient, resourceType, resourceId) {
        var resourceDataJson = this.state.resourceDataJson;
        let readResponse = await fhirClient.read({ resourceType: resourceType, id: resourceId });
        readResponse.id = resourceId;
        console.log("patient read---",readResponse);
        resourceDataJson.push(readResponse)
        this.setState({ resourceDataJson: resourceDataJson });
        console.log("Resource json---", this.state.resourceDataJson);
    }

    async authorize() {
        var settings = this.getSettings();
        try {
        console.log(settings.api_server_uri,'server uri')
		const fhirClient = new Client({ baseUrl: settings.api_server_uri });
	if (config.authorized_fhir){	
            var { authorizeUrl, tokenUrl } = await fhirClient.smartAuthMetadata();
            console.log(authorizeUrl,tokenUrl,'here')
        	if(settings.api_server_uri.search('18.222.7.99') > 0){
	            authorizeUrl = {protocol:"https://",host:"18.222.7.99:8443/",pathname:"auth/realms/ProviderCredentials/protocol/openid-connect/auth"}
        	    tokenUrl = {protocol:"https:",host:"18.222.7.99:8443",pathname:"auth/realms/ProviderCredentials/protocol/openid-connect/token"}
	        }
        	const oauth2 = simpleOauthModule.create({
            	client: {
                	id: settings.client_id
	            },
        	    auth: {
                	tokenHost: `${tokenUrl.protocol}//${tokenUrl.host}`,
	                // tokenHost: "https://54.227.173.76:8443/",
	                tokenPath: tokenUrl.pathname,
        	        authorizeHost: `${authorizeUrl.protocol}//${authorizeUrl.host}`,
                	authorizePath: authorizeUrl.pathname,
	            },
            });
	        const options = { code: this.state.code, redirect_uri: `${window.location.protocol}//${window.location.host}/index`, client_id: settings.client_id };
            console.log(oauth2,'oauth2',options)
            const result = await oauth2.authorizationCode.getToken(options);
            const { token } = oauth2.accessToken.create(result);
            sessionStorage.getItem("tokenResponse", token.access_token);
            console.log('The token is : ', token);
            fhirClient.bearerToken = token.access_token;
	}
            const url = config.crd_url + "smart_app";
            console.log("fetching data from " + url)
            var self = this;
            var patientId='';
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'appContext': settings.launch_id,
                }),
            }, Promise.resolve()).then((response) => {
                return response.json();
            }).then((response) => {
                Object.keys(response[0].appData).forEach(function (key) {
                    var val = response[0].appData[key]
                    console.log(response[0].appData,'heres the value',response[0].appData[key],key)
                    if (key === 'patientId') {
                        key = 'Patient'
                        patientId= val
                    }
                    else if(key === 'Practitioner'){
                        self.searchFHIR(fhirClient,key,'identifier='+ val,'provider')
                    }
                    if (val !== '' && key !== 'Practitioner') {
                        self.readFHIR(fhirClient, key, val);
                    }
                });
                var docs = [];
                response[0].requirements.map((i, req) => {
                    
                    if (Object.prototype.toString.call(response[0].requirements[req]) !== '[object Array]' && typeof response[0].requirements[req] != "string") {
                        Object.keys(response[0].requirements[req]).forEach(function (res_type) {
                            var code = response[0].requirements[req][res_type]['codes'][0]['code'];
                            if (res_type !== 'EpisodeOfCare' && res_type !== 'Location') {
                                self.searchFHIR(fhirClient, res_type, "code=" + code+"&patient="+patientId,'provider');
                            }
                        });
                    }
                    if (typeof response[0].requirements[req] === "string") {
                        docs.push(response[0].requirements[req]);
                        this.setState({ docs: docs });
                    }
                })
                if (response[0].hasOwnProperty("prior_authorization") && response[0].prior_authorization) {
                    this.setState({ prior_authorization: true })
                    this.setState({claim_type: 'Prior Authorization'});
                } else {
                    this.setState({ prior_authorization: false });
                }
            })
        } catch (error) {
            console.error('Access Token Error', error.message);
            console.log('Authentication failed');
            this.setState({token_error : true}); 
        }
    }
    reLaunch(){
        var settings = this.getSettings();
        if(settings.hasOwnProperty('launch_id') && settings.hasOwnProperty('api_server_uri')){
            var launchUrl = window.location.protocol+"//" + window.location.host +"/launch?launch="+settings.launch_id+"&iss="+settings.api_server_uri;
            window.location = launchUrl;
        }
    }
    hasAuthToken() {
        return sessionStorage.getItem("tokenResponse") !== undefined;
    }
    refreshApp() {
        withRouter(({ history }) => (history.push('/')))
    }
    async getClaimResponse(claim_id){
        const fhirClient = new Client({ baseUrl: config.payer_fhir });
        const token = await createToken(sessionStorage.getItem('username'), sessionStorage.getItem('password'));
        fhirClient.bearerToken = token;
        this.searchFHIR(fhirClient,'ClaimResponse','request='+claim_id,'payer')
        
    }
    syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
    renderObject(inputObj) {
        return (
            <div><pre>{JSON.stringify(inputObj, null, 2)}</pre></div>
        )
        // return (
        //   <div>
        //       {this.syntaxHighlight(JSON.stringify(inputObj))}
        //       {/* {Object.keys(inputObj).forEach((key, i) =>{
        //           return(<div>{JSON.stringify(inputObj[key])}</div>)
        //         })} */}
        //     {/* {Object.keys(inputObj).forEach((key, i) =>{
        //         if (typeof(inputObj[key]) == "string" && key !== "id" && key !== "resourceType"){
        //           return(
        //             <div key={i}>
        //               <div className="left-col">{key}</div>
        //               <div className="right-col">{inputObj[key]}</div>
        //             </div>)
        //         }
        //         if (typeof(inputObj[key]) == "object" && key !== "id" && key !== "resourceType"){
        //           console.log("recursive---------------",inputObj[key], "---------", key);
        //            this.renderObject(inputObj[key])
        //         }
        //       })} */}
        //   </div>
        // )
    }
    renderPage() {
        const files = this.state.files.map(file => (
            <div className='file-block' key={file.name}>
                <a onClick={() => this.onRemove(file)} className="close-thik"></a>
                {file.name}
            </div>
        ))
        const resourceMainData = this.state.resourceDataJson.map((res, index) => {
                // delete res.id;
                return (
                    <div key={index}>
                        <div className="header">{res.resourceType}</div>
                        {/* {this.renderObject(res)} */}
                        <ReactJson  className="dropdown"
                            enableClipboard={false} 
                            collapsed={1} 
                            indentWidth={4}
                            theme="shapeshifter:inverted"
                            name= {false}
                            iconStyle="triangle"
                            displayObjectSize={false}
                            displayDataTypes={false}
                            src={pascalcaseKeys(res)} />
                    </div>);
                    
        });
        const documents = this.state.docs.map((res, index) => {
                return (
                    <div key={index}>
                        <div><span>{index+1}. </span>{res}</div>
                    </div>);
        });
        const resourceData = this.state.resourceJson.map((res, index) => {
            // delete res.id;
                return (
                    <div key={index}>
                        <div className="header">{res.resourceType}</div>
                        {/* {this.renderObject(res)} */}
                        <ReactJson  
                            enableClipboard={false} 
                            collapsed={1} 
                            indentWidth={4}
                            theme="shapeshifter:inverted"
                            name= {false}
                            iconStyle="triangle"
                            displayObjectSize={false}
                            displayDataTypes={false}
                            src={pascalcaseKeys(res)} />
                    </div>);
        });
        console.log(this.state.code,'sss',this.hasAuthToken());
        if (!this.hasAuthToken()) {
            if (this.state.code) {
                this.authorize();
            } else {
                return (
                    <div>
                        <div>Not yet authorized</div>
                        <div><input type="submit" value="Sign In" onClick={this.authorize} /></div>
                    </div>
                )
            }
        } else {
            return (
                <React.Fragment>
                    <div>
                        <div className="main_heading">HEALTH INSURANCE SUBMIT - { this.state.claim_type }</div>
                        <div className="content">
                            {this.state.claimResponse === '' && !this.state.token_error &&
                                <div>
                                    <div className="left-form">
                                        {resourceMainData}
                                        {resourceData}
                                    </div>
                                    <div className="right-form">
                                        <div className="header">
                                            Prior Authorization - <span className="simple-text">{this.state.prior_authorization && <span>Required</span>}
                                            {!this.state.prior_authorization && <span>Not Required</span>}</span>
                                        </div>
                                        <div className="header">
                                            Upload Required/Additional Documentation
                                        </div>
                                        <span>
                                        </span>
                                        <div className="">
                                            <div className="left-col">Required Documents</div>
                                            <div className="right-col">{documents}</div>
                                        </div>
                                        <div className="drop-box">
                                            <section>
                                                <Dropzone
                                                    onDrop={this.onDrop.bind(this)}
                                                    onFileDialogCancel={this.onCancel.bind(this)
                                                    }
                                                >
                                                    {({ getRootProps, getInputProps }) => (
                                                        <div    >
                                                            <div className='drag-drop-box' {...getRootProps()}>
                                                                <input {...getInputProps()} />
                                                                <div className="file-upload-icon"><FontAwesomeIcon icon={faCloudUploadAlt} /></div>
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
                                            <textarea name="myNotes" value={this.state.additionalNotes} onChange={this.onNotesChange} rows="10" cols="83" />
                                        </div>

                                        <button className="submit-btn btn btn-class button-ready" onClick={this.createFhirResource}> 
                                        Submit {this.state.claim_type}
                        <div id="fse" className={"spinner " + (this.state.loading ? "visible" : "invisible")}>
                                                <Loader
                                                    type="Oval"
                                                    color="#222222"
                                                    height="16"
                                                    width="16"
                                                />
                                            </div>
                                        </button>
                                    </div>
                                </div>
                                    }
                                    {this.state.token_error && 
                                    <div className="container token_expired">Your Token has expired !!
                                        <div><button className="btn button-ready" onClick={this.reLaunch}>Refresh Token</button></div>
                                    </div>}
                        {this.state.claimResponse !== '' &&
                            <div>
                            {this.state.claimResponse.success &&
                                        <div className="claim_res_div">
                                            <div className='decision-card alert-info'>
                                                <div>
                                                    <strong>Success:</strong>{this.state.claimResponse.message}
                                                </div>
                                                {/* <div>
                                                    Checking with the CDS service.
                                                </div> */}
                                                <div>
                                                    Check for the {this.state.claim_type} status <button onClick={() => this.getClaimResponse(this.state.claim_id)}>Get {this.state.claim_type} Status</button>
                                                </div>
                                                {this.state.show_res  && 
                                                <div>
                                                    {this.state.claimResponseJson.length !== undefined &&
                                                        <div>{this.state.claim_type} Response:
                                                            <pre>{JSON.stringify(this.state.claimResponseJson, null, 2)}</pre>
                                                        </div>
                                                    }
                                                    {(this.state.searchResponse!==''||this.state.searchResponse!==null) &&
                                                        <div className='claimResponse'>{this.state.searchResponse}</div>
                                                    }
                                                </div>
                                                }
                                            </div>
                                        </div>
                            }
                            {!this.state.claimResponse.success &&
                                <div className='decision-card alert-warning'><strong> Failed : </strong> {this.state.claimResponse.message}</div>
                            }
                            </div>
                                    }
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
