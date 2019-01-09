import React from 'react';
import $ from 'jquery';
import { createToken } from '../components/Authentication';
import config from '../properties.json';
import {Input,Button} from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';

class LoginPage extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      name: '',
      password: '',
      fhir_url: '',
      login_load: false,
      login_error_msg: '',
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
    this.setState({login_load: true, login_error_msg: ''});
    console.log('in if and token is---',this.state.name,this.state.password,config.username,config.password)
    let tokenResponse = await createToken(this.state.name,this.state.password);
    if(tokenResponse !==null && tokenResponse !==undefined){
        console.log('in if and token is---',tokenResponse) 
        sessionStorage.setItem('username', this.state.name);
        sessionStorage.setItem('password', this.state.password);
        sessionStorage.setItem('isLoggedIn', true);
        this.props.history.push('/provider_request');
    }
    this.setState({login_load: false, login_error_msg: "Unable to login! Please try again."});
  }
  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
        this.onClickLoginSubmit();
    }
};

  render() {
    // const {classes} = this.props;
    return (
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
            <label>Provider Log In</label>
          </div>
          <div className="col-12 padding-top-10px">
            <Input
                // id="full-width"
                label="Username/Email Id"
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
                label="Password"
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
            <div className="row col-12 padding-top-10px" style={{'paddingRight': '0px'}}>
              <div className="col-8 errorMsg padding-top-10px">
                {this.state.login_error_msg}
              </div>
              <div className="col-4" style={{'paddingRight': '0px','textAlign':'right'}}>
                <Button primary onClick={this.onClickLoginSubmit }>
                  Login 
                </Button>
                <div style={{'minHeight': '30px'}}>
                {/* {this.state.login_load && <img src={logo} alt="Loading.."/>} */}
                </div>
              </div>
          </div>
        </div>
  );
  }
}



export default withRouter(LoginPage);
