import React, {Component} from 'react';
import queryString from 'query-string';
import simpleOauthModule from 'simple-oauth2';
import Client from 'fhir-kit-client';
import config from '../properties.json';

export default class Review extends Component {
  constructor(props){
    super(props);
    this.state = {
       launch : queryString.parse(this.props.location.search, { ignoreQueryPrefix: true }).launch,
       iss : queryString.parse(this.props.location.search, { ignoreQueryPrefix: true }).iss
    }
    this.initialize = this.initialize.bind(this);   
       
    if (sessionStorage.getItem('username') === 'john'){
      this.initialize({
          client_id: "app-login",
          scope: "patient/* openid profile"
        });
    } else {
        this.initialize({
          client_id: "385b8e12-722f-4c43-9ab1-7c2aed14004e",
          scope: "patient/* openid profile"
        });
    }
  }
  setSettings(data) {
    sessionStorage.setItem("app-settings", JSON.stringify(data));
  }
  clearAuthToken() {
    sessionStorage.removeItem('tokenResponse');
  }

  getSettings() {
    var data = sessionStorage.getItem("app-settings");
    return JSON.parse(data);
  }
  async initialize(settings) {
      sessionStorage.removeItem('app-settings');
      this.setSettings({
          client_id     :  settings.client_id,
          secret        : "7e5e0e32-0dcd-4f6f-9b72-d0021e08c0e",
          scope         : settings.scope + " launch",
          launch_id     : this.state.launch,
          api_server_uri: this.state.iss
          // api_server_uri: "http://3.92.187.150:8280/fhir/baseDstu3/"
      });
      
      var settings = this.getSettings();
      this.clearAuthToken();
      console.log(settings.api_server_uri)
      const fhirClient = new Client({ baseUrl: settings.api_server_uri });
      if (config.authorized_fhir === true){
         var { authorizeUrl, tokenUrl } = await fhirClient.smartAuthMetadata();
      
         if(settings.api_server_uri.search('3.92.187.150') > 0){
           authorizeUrl
            = {protocol:"https://",host:"3.92.187.150:8443/",pathname:"auth/realms/ProviderCredentials/protocol/openid-connect/auth"}
           tokenUrl = {protocol:"https:",host:"3.92.187.150:8443",pathname:"auth/realms/ProviderCredentials/protocol/openid-connect/token"}
         }

         // //////////////

         //  authorizeUrl= {protocol:"https://",host:"3.92.187.150:8443/",pathname:"auth/realms/ProviderCredentials/protocol/openid-connect/auth"}
         //  tokenUrl = {protocol:"https:",host:"3.92.187.150:8443",pathname:"auth/realms/ProviderCredentials/protocol/openid-connect/token"}

         // //////////////
         const oauth2 = simpleOauthModule.create({
          client: {
          id: settings.client_id,
          secret:settings.secret
          },
          auth: {
          tokenHost: `${tokenUrl.protocol}//${tokenUrl.host}`,
          // tokenHost:tokenUrl.host,
          tokenPath: tokenUrl.pathname,
          authorizeHost: `${authorizeUrl.protocol}//${authorizeUrl.host}`,
          authorizePath: authorizeUrl.pathname,
          },
         });

         console.log("Current URL--",`${window.location.protocol}//${window.location.host}/index`);
         // Authorization uri definition
         const authorizationUri = oauth2.authorizationCode.authorizeURL({
             redirect_uri: `${window.location.protocol}//${window.location.host}/index`,
             aud: settings.api_server_uri,
             scope: settings.scope,
             state: '3(#0/!~',
         });
         console.log(authorizationUri,'authorize')
         window.location = authorizationUri;
	}
        if (!config.authorized_fhir){
        	window.location = `${window.location.protocol}//${window.location.host}/index`;
      	}
  }

  render() {
    return (
      <div className="attributes mdl-grid">
         Launching......
      </div>)
  }
}
