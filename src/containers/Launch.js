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
       
    this.initialize({
          client_id: config.client_id,
          scope: "patient/* openid profile"
        });
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
      this.setSettings({
          client_id     : settings.client_id,
          secret        : settings.secret,
          scope         : settings.scope + " launch",
          launch_id     : this.state.launch,
          api_server_uri: this.state.iss
      });
      
//      var settings = this.getSettings();
      this.clearAuthToken();
      const fhirClient = new Client({ baseUrl: settings.api_server_uri });
      var { authorizeUrl, tokenUrl } = await fhirClient.smartAuthMetadata();
      authorizeUrl = {protocol:"https://",host:"54.227.173.76:8443/",pathname:"auth/realms/ClientFhirServer/protocol/openid-connect/auth"}
      tokenUrl = {protocol:"https://",host:"54.227.173.76:8443/",pathname:"auth/realms/ClientFhirServer/protocol/openid-connect/token"}
      const oauth2 = simpleOauthModule.create({
          client: {
          id: settings.client_id
          },
          auth: {
          tokenHost: `${tokenUrl.protocol}//${tokenUrl.host}`,
          tokenPath: tokenUrl.pathname,
          authorizeHost: `${authorizeUrl.protocol}//${authorizeUrl.host}`,
          authorizePath: authorizeUrl.pathname,
          },
      });

      // Authorization uri definition
      const authorizationUri = oauth2.authorizationCode.authorizeURL({
          redirect_uri: 'http://localhost:3000/index',
          aud: settings.api_server_uri,
          scope: settings.scope,
          state: '3(#0/!~',
      });

      window.location = authorizationUri;
  }

  render() {
    return (
      <div className="attributes mdl-grid">
         Launching......
      </div>)
  }
}