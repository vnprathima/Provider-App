import React, { Component } from 'react';
import {Switch} from 'react-router';
import {BrowserRouter, Redirect, Route} from 'react-router-dom';
import RequestBuilder from '../containers/RequestBuilder';
import CoverageDetermination from '../containers/CoverageDetermination';
import PriorAuthorization from '../containers/PriorAuthorization';
import ProviderRequest from '../containers/ProviderRequest';
import Review from '../containers/Review';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faIgloo,faNotesMedical } from '@fortawesome/free-solid-svg-icons'

library.add(faIgloo,faNotesMedical)
export default class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={() => { return <Redirect to="/provider_request" />}} />
                    <Route path={"/cr"} component={RequestBuilder} />
                    <Route path={"/cd"} component={CoverageDetermination} />
                    <Route path={"/prior_auth"} component={PriorAuthorization} />
                    <Route path={"/provider_request"} component={ProviderRequest} />                    
                    <Route path={"/review"} component={Review} />
                </Switch>
            </BrowserRouter>
        );
    }
}