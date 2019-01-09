import React from 'react';
import $ from 'jquery';
import { createToken } from '../components/Authentication';
import config from '../properties.json';
import {Input,Button} from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import Cookies from 'universal-cookie';



// $(document).keypress(function(e) {
//   if(e.which === 13) {
//     $('#submitButton').trigger('click');
//   }
// });
const cookies = new Cookies();

class LoginPage extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      serverUrl: false,
      dataBase: '',
      name: '',
      password: '',
      server: '',
      login_load: false,
      login_error_msg: '',
      isAuthenticated: false,
    }
    this.handleUrl = this.handleUrl.bind(this);
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

  userHasAuthenticated = authenticated => {
    this.setState({ isAuthenticated: authenticated });
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

  handleUrl(event){
    console.log(event.target.value,'yyayyayya url');
    cookies.set('fhir_url', event.target.value);
    config.fhir_url=cookies.get('fhir_url');
    this.setState({server: event.target.value});
  }

  // handleUrl(){
  //   this.setState({serverUrl: this.state.serverUrl})
  // }

  submit(){
    if (this.props.isLoggedIn && this.props.sessionID){
      this.props.getModels(this.props.sessionID);
    }
  }

  async onClickLoginSubmit(){
      this.setState({login_load: true, login_error_msg: ''});
      console.log('in if and token is---',this.state.name,this.state.password,config.username,config.password)
    //   await this.props.login(this.state.dataBase, this.state.name, this.state.password, this.state.server);
    let tokenResponse = await createToken(this.state.name,this.state.password);
    if(tokenResponse !=null && tokenResponse !=undefined){
    console.log('in if and token is---',tokenResponse) 
        var path = '/provider_request';
        cookies.set('isLoggedIn', true);
        this.props.history.push(path);
        console.log('ypppp')        
    }
    this.setState({login_load: false, login_error_msg: "Unable to login! Please try again."});
  }
  handleKeyPress = (e) => {
    // console.log(e.key);
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
            <div className="col-12 padding-top-10px">
            <Input
                // id="full-width"
                label="URL"
                type="text"
                className='ui fluid   input'
                // className = {classes.textField}
                onChange={this.handleUrl.bind(this)}
                defaultValue={this.state.server}
                fluid
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
