import React from 'react';
import $ from 'jquery';
import { createToken } from '../components/Authentication';
import config from '../globalConfiguration.json';
import {Input,Button} from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import Loader from 'react-loader-spinner';
// var humps = require('humps');

class LoginPage extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      name: '',
      password: '',
      fhir_url: '',
      login_error_msg: '',
      loading: false,
    }
    this.handleName = this.handleName.bind(this);
    this.handlepassword = this.handlepassword.bind(this);
    this.handleDataBase = this.handleDataBase.bind(this);
    this.submit = this.submit.bind(this);
    this.onClickLoginSubmit = this.onClickLoginSubmit.bind(this);
  }

  componentDidMount(){
    $('input[type="password"]').on('focus', () => {
      $('*').addClass('password');
    }).on('focusout', () => {
      $('*').removeClass('password');
    });
  }

  handleName(event){
    this.setState({name: event.target.value});
  }

  handlepassword(event){
    this.setState({password: event.target.value});
  }

  handleDataBase(event){
    this.setState({dataBase: event.target.value});
  }


  submit(){
    if (this.props.isLoggedIn && this.props.sessionID){
      this.props.getModels(this.props.sessionID);
    }
  }

  async onClickLoginSubmit(){
    this.setState({loading: true, login_error_msg: ''});
    console.log('in if and token is---',this.state.name,this.state.password,config.username,config.password)
    let tokenResponse = await createToken(this.state.name,this.state.password);
    if(tokenResponse !==null && tokenResponse !==undefined){
        console.log('in if and token is---',tokenResponse) 
        
        sessionStorage.setItem('username', this.state.name);
        sessionStorage.setItem('password', this.state.password);
        for(var key in config.user_profiles){
          if(this.state.name===config.user_profiles[key].username){
            sessionStorage.setItem('npi',config.user_profiles[key].npi);
            sessionStorage.setItem('name',config.user_profiles[key].name);
          }
        }
        sessionStorage.setItem('isLoggedIn', true);
        this.props.history.push('/provider_request');
    }
    this.setState({loading: false, login_error_msg: "Unable to login! Please try again."});
  }
  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
        this.onClickLoginSubmit();
    }
};

  render() {
    // const {classes} = this.props;
    return (
      <div className="main">
        <div className="row login-form" onKeyPress={this.handleKeyPress}tabIndex="1">
          {/* <div className="owl" onClick={this.onClickLogin}>
            <div className="hand"></div>
            <div className="hand hand-r"></div>
            <div className="arms">
              <div className="arm"></div>
              <div className="arm arm-r"></div>
            </div>
          </div> */}
          <div className="col-12" style={{'textAlign':'center'}}>
            {/* <img className="udefyn_logo" src={udefyn_logo} alt="Udefyn Logo" onClick={this.onClickLogin}/> */}
          </div>
          <div className="col-12 signin">
            Provider Application
          </div>
          <div className="col-12 padding-top-10px">
            <Input
                // id="full-width"
                label="USER NAME"
                type='text'
                // className = {classes.textField}
                className='ui fluid   input'
                onChange={this.handleName.bind(this)}
                defaultValue={this.state.name}
                fluid
                inputProps={{
                maxLength: 50,
                }}
            />
            </div>
          <div className="col-12 padding-top-10px">
            <Input
                // id="full-width"
                label="PASSWORD"
                type="password"
                className='ui fluid   input'
                // className = {classes.textField}
                onChange={this.handlepassword.bind(this)}
                defaultValue={this.state.password}
                fluid
                inputProps={{
                maxLength: 50,
                }}
            />
            </div>         
            <div className="col-12 padding-top-10px" style={{'paddingRight': '0px'}}>
              <div className="col-8 errorMsg padding-top-10px">
                {this.state.login_error_msg}
              </div>
              <div className="col-4" style={{'paddingRight': '0px','textAlign':'right'}}>
                <button className="submit-btn btn btn-class button-ready" onClick={this.onClickLoginSubmit}>
                  <span className="login-text">Login</span>  
                  <div id="fse" className={"spinner " + (this.state.loading ? "visible" : "invisible")}>
                      <Loader
                          type="Oval"
                          color="#fff"
                          height="15"
                          width="15"
                      />
                  </div>
                </button>
                <div style={{'minHeight': '30px'}}>
                </div>
              </div>
          </div>
        </div>
      </div>
  );
  }
}



export default withRouter(LoginPage);
