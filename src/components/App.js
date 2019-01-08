import React, { Component } from 'react';
import {Switch} from 'react-router';
import {BrowserRouter, Redirect, Route} from 'react-router-dom';
// import PrivateRoute from './privateRoute';
import RequestBuilder from '../containers/RequestBuilder';
import CoverageDetermination from '../containers/CoverageDetermination';
import PriorAuthorization from '../containers/PriorAuthorization';
import ProviderRequest from '../containers/ProviderRequest';
import Review from '../containers/Review';
// import LoginPage from '../containers/loginPage';
import Launch from '../containers/Launch';
import Main from '../containers/Main';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faIgloo,faNotesMedical } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
console.log(cookies.get('isLoggedIn'))

library.add(faIgloo,faNotesMedical)
export default class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={() => {if(cookies.get('isLoggedIn')){return <Redirect to="/login" />}else{return <Redirect to="/login" />}}}/>
                    {/* <Route exact path="/" component={() => { return <Redirect to="/login" />}} /> */}
                    {/* <Route path={"/login"} component={() => {if(cookies.get('isLoggedIn')){return <Redirect to="/login" />}else{return <LoginPage />}}} /> */}
                    {/* <Route path={"/login"} component={LoginPage} />                     */}
                    <Route path={"/cr"} component={RequestBuilder} />
                    <Route path={"/cd"} component={CoverageDetermination} />
                    <Route path={"/prior_auth"} component={PriorAuthorization} />
                    <Route path={"/provider_request"} component={ProviderRequest} />                    
                    <Route path={"/review"} component={Review} />
                    <Route exact path="/index" component={Main} />
                    <Route path={"/launch"} component={Launch} />
                </Switch>
            </BrowserRouter>
        );
    }
}