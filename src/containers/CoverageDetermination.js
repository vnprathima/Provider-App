import React, { Component } from 'react';
//import { createJwt } from '../components/AuthenticationJwt';
import Dropzone from 'react-dropzone';
import 'font-awesome/css/font-awesome.min.css';
import '../index.css';
import '../components/consoleBox.css';
import Loader from 'react-loader-spinner';
import config from '../properties.json';
import { KEYUTIL } from 'jsrsasign';
import { createToken } from '../components/Authentication';
import 'react-table/react-table.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import DisplayBox from '../components/DisplayBox';
//import RecursiveIterator from 'recursive-iterator';
import deepIterator from 'deep-iterator';

const types = {
  error: "errorClass",
  info: "infoClass",
  debug: "debugClass",
  warning: "warningClass"
}
//let inputData = {};

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
      files: [],
      additionalNotes:'',
      errors: {},
      resourceJson: []
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
    this.onNotesChange=this.onNotesChange.bind(this);
    this.onRemove=this.onRemove.bind(this);
    // this.uploadFile = this.uploadFile.bind(this);

    this.getResourceRecords = this.getResourceRecords.bind(this);
    if (window.location.href.indexOf("appContext") > -1) {

      this.appContext = decodeURIComponent(window.location.href.split("?")[1]).split("appContext=")[1];
      // this.hook =  decodeURIComponent(window.location.href.split("?")[1]).split('&appContext')[0].split('hook=')[1]
      console.log("this.appContext");
    console.log(this.appContext);
    console.log(this.hook,'hoookks')

      this.getResourceRecords(this.appContext);
    }
    else {
      this.appContext = null;
    }
    
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
  onDrop(files) {
    this.setState({ files });
  }

  onCancel() {
    this.setState({
      files: []
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

  updateStateElement = (elementName, text) => {
    this.setState({ [elementName]: text });
  }

  startLoading() {
    this.setState({ loading: true }, () => {
      this.submit_info();
    });
  }

  submit_prior_auth() {
//    this.state.prior_auth = true;
    this.setState({ prior_auth: true });
    console.log(this.state.prior_auth, '--------------');
    this.setState({ loading: true }, () => {
      this.submit_info();
    });
  }

  async getResourceRecords(appContext) {
    let tokenResponse = await createToken(config.username,config.password);
    console.log(tokenResponse);
    await this.getValusets( tokenResponse,appContext);
  }

  async getValusets( token,appContext) {
    const url = config.crd_url + "smart_app";
    console.log("fetching data from "+url,types.info)
    // const url = "http://localhost:8181/hapi-fhir-jpaserver-example/baseDstu3/"+valueset;
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": "Bearer " + token,
      },
      body: JSON.stringify({
          'appContext':appContext,
          'hook':this.hook,

      }),
    }).then((response) => {
      return response.json();
    }).then((response) => {
      this.setState({resourceJson: response});
      console.log("Resource json---",this.state.resourceJson);

    })
  }

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
  onNotesChange (event){
    this.setState({ additionalNotes: event.target.value });
    // this.props.updateCB(this.props.elementName, event.target.value);
  }
  async submit_info() {
    this.consoleLog("Initiating form submission", types.info);

    let json_request = await this.getJson();
    // console.log(JSON.stringify(json_request))
    // console.log("Req: ", json_request);
    // var auth = 'Basic ' + new Buffer(config.username + ':' + config.password).toString('base64');
    // var myHeaders = new Headers({
    //   "Content-Type": "application/json",
    //   "authorization": auth,
    // });
    // let inputData = {};
    // let jwt = await createJwt();
    // console.log('jwttttt', jwt)
    // jwt = "Bearer " + jwt;
    let token = await createToken(config.username,config.password);
    token = "Bearer " + token;
    var myHeaders = new Headers({
        "Content-Type": "application/json",
        "authorization": token,
    });
    let url = config.crd_url + '' + config.provider_coverage_decision_url
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
        this.setState({ response: res_json });
      }
      this.setState({ loading: false });
    } catch (error) {
      this.setState({ loading: false });
      this.consoleLog("Unexpected error occured", types.error)
      if (error instanceof TypeError) {
        this.consoleLog(error.name + ": " + error.message, types.error);
      }
    }

  }
   renderObject(inputObj) {
    // console.log("In render ", inputObj);

    const it = deepIterator(inputObj);
      for (let {parent, key} of it) {
        console.log(parent,key,'parent:key');
      }
    // for (let {node, path,key} of new RecursiveIterator(inputObj)) {
    //   console.log(typeof(path) ,'----', node,'iiiiiiiii')
    //   if(path != "id" && path != "resourceType" ,path!="extension"){
    //     console.log('path:',path[0],node)
    //     return(
    //     <div key={node.key}>
    //       <div className="left-col">{path[0]}</div>
    //       <div className="right-col">{node}</div>
    //     </div>)
    //   }
      // return(
      //   <div key={key}>
      //     <div className="left-col">{path}</div>
      //     <div className="right-col">{node}</div>
      //   </div>)
    // }
    return (
      <div>
        {Object.keys(inputObj).forEach((key, i) =>{
            if (typeof(inputObj[key]) == "string" && key !== "id" && key !== "resourceType"){
              return(
                <div key={i}>
                  <div className="left-col">{key}</div>
                  <div className="right-col">{inputObj[key]}</div>
                </div>)
            }
            if (typeof(inputObj[key]) == "object" && key !== "id" && key !== "resourceType"){
              console.log("recursive---------------",inputObj[key], "---------", key);
               this.renderObject(inputObj[key])

        
            }
          })}
      </div>
    )
  }
  // renderObject(inputObj){
  //   console.log("In render ", inputObj);
  //   return(
  //     <div>
  //       {Object.keys(inputObj).map((key, i) =>{
  //         if (typeof(inputObj[key]) == "string"){
  //           return(
  //             <div key={i}>
  //               <div className="left-col">{key}</div>
  //               <div className="right-col">{inputObj[key]}</div>
  //             </div>)
  //         }
  //         else if((typeof(inputObj[key]) == "object" && key != "id" && key != "resourceType")){
  //           console.log("recursive---------------",inputObj[key], "---------", key);
  //           var ob =inputObj[key];
  //           if(Array.isArray(inputObj[key] )){
  //             ob.map(k=>{
  //               if(ob.hasOwnProperty(k)){
  //                 console.log('yaha pe')
                  
  //                 {Object.keys(k).map((new_key, j) =>{
  //                   if (typeof(k[new_key]) == "string"){
  //                     console.log('in loopss',k[new_key])

  //                     // return(
  //                     //   <div key={j}>
  //                     //   <div className="left-col">'''''''''''''''''''''''''''''</div>
  //                     //     <div className="left-col">{new_key}</div>
  //                     //     <div className="right-col">{k[new_key]}</div>
  //                     //   </div>)
  //                   }
  //                 })
  //               }
  //               }
  //             })
  //           }
  //           {Object.keys(ob).map((new_key, j) =>{
  //             if (typeof ob[new_key] == "string"){
  //               console.log('in loopss',ob[new_key])
  //               return(
  //                 <div key={j}>
  //                   <div className="left-col">{new_key}</div>
  //                   <div className="right-col">{ob[new_key]}</div>
  //                 </div>)
  //             }
  //           })
  //         }
  //         }
          
  //       })

  //       }
  //     </div>
  //   )

  // }
  renderClaimSubmit() {
//    const status_opts = config.status_options;
    // const validationResult = this.validateState();
    const validationResult = this.validateState();
    const total = Object.keys(validationResult).reduce((previous, current) => {
      return validationResult[current] * previous
    }, 1);
    const files = this.state.files.map(file => (
      // console.log(file,'is it the same file')
      <div className='file-block' key={file.name}>
        <button onClick={() => this.onRemove(file)} className="close-thik"></button>
        {file.name}
      </div>
    ))
    console.log(this.state.resourceJson,'this is resource json')
    const resourceData = this.state.resourceJson.map((res, index) => {
      return (
        <div key={index}>
          {/* <div className="header">{res.resource.resourceType}</div> */}
          <div className="header">{res.resourceType}</div>
          {/* {this.renderObject(res)} */}
          {/* <RenderJson root={res}></RenderJson> */}
        </div>);
    });

    return (
      <React.Fragment>
        <div>
          <div className="main_heading">HEALTH INSURANCE CLAIM SUBMIT</div>
          <div className="content">
            <div className="left-form">
              {resourceData}  
              {/* <RenderJson root={this.state.resourceJson}></RenderJson> */}
            </div>
            <div className="right-form">
              <div className="header">
                Upload Required/Additional Documentation
                  </div>
              <span>
              </span>
              <div className="">
                <div className="left-col">Required Documents</div>
                <div className="right-col">Seven Element order, Xray of Liver</div>
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
              <div >
                        <DisplayBox
                        response = {this.state.response} req_type="coverage_determination" />
                    </div>
            </div>

          </div>
        </div>
      </React.Fragment>);
  };
  
  
  async getJson() {
//    var patientId = null;
  //  var practitionerId = null;
   // var coverageId = null;
    //var encounterId = '';
    var patient_details='';
    var practitioner_details='';
    var procedure_details='';
   // var gender = null;
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
          if(this.state.resourceJson[x].resourceType==='Patient'){
            patient_details = this.state.resourceJson[x]
          }
          else if(this.state.resourceJson[x].resourceType==='Practitioner'){
            practitioner_details=this.state.resourceJson[x]
          }
          else if(this.state.resourceJson[x].resourceType==='Procedure'){
            procedure_details=this.state.resourceJson[x]
          }
        }
      }
    }
    console.log(patient_details.resourceType+"/"+patient_details.id,'oooooo')
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
              
              
              // request.context.orders.entry[0].push(inputData)

          }
          reader.readAsBinaryString(file);
        })(this.state.files[i])
        // let rd=this.setupReader(this.state.files[i]);
        // request.context.orders.entry[0].push(rd);
      }
      // console.log
      
    }

    request.contained[0].push(fileInputData)
    // console.log(request,'qwertyuiowertyuert');
    // console.log(JSON.stringify(request),'pppp')

    // request.context.orders.entry[0].push(msgDefinition)

    // if (this.state.hook === 'order-review') {
    //   request.context.encounterId = this.state.encounter
    // }
    // console.log(request,'yippppppppyyyy')
    return request;
  }
  render() {
    return (
      <div className="attributes mdl-grid">
        {this.renderClaimSubmit()}
      </div>)
  }
}
