import React, { Component } from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route
} from "react-router-dom";
import PropTypes from "prop-types";

import { PrivateRoute, PropsRoute } from '../Routes';
import ThingExplorer from "../ThingExplorer/ThingExplorer.js";
import Characters from "../Characters/Characters.js";
import Login from "./Login.js";
import Packs from "../Packs/Packs";
import Explore from "../Explore/Explore";
import DB from "../../actions/CRUDAction";
import Nav from './Nav';
import Splash from '../Explore/Splash'

import "./App.css";

const NotFound = () => (
	<div className="container">
		<h1>404 Not Found</h1>
	</div>
)

class App extends Component {
	constructor(){
		super();
		this.state = {
			loggedIn: null
		}
		this.handleLogin = this.handleLogin.bind(this);
		this.handleLogout = this.handleLogout.bind(this);
	}
	static get childContextTypes(){
		return {
			loggedIn: PropTypes.bool
		}
	}
	getChildContext(){
		return { loggedIn: !!this.state.loggedIn };
	}
	componentDidMount(){
		DB.fetch("loggedIn").then((result) => {
			if(result.data)
				this.setState({ loggedIn: !!result.data.loggedIn })
		})
	}
	handleLogin(url, payload){
		return DB.create(url, payload).then((result) => {
			var loggedIn = !result.error && result.data;
			this.setState({ loggedIn: !!loggedIn });
			return result;
		});
	}
	handleLogout(){
		return DB.fetch('logout', "POST").then((result) => {
			this.setState({ loggedIn: !!result.data.loggedIn })
			return result;
		});
	}
	render() {
		return (
			<Router>
				<div className="App">
					<Nav handleLogout={this.handleLogout} />
					<Switch>
						<Route exact path="/" component={Splash} />
						<Route path="/things" component={ThingExplorer} />
						<Route path="/characters" component={Characters} />
						<PropsRoute path="/login" component={Login} title="Login" handleLogin={this.handleLogin} />
						<PropsRoute path="/signup" component={Login} title="Sign up" handleLogin={this.handleLogin} />
						<PropsRoute path="/packs" component={Packs} />
						<Route path="/explore/:packurl" component={Explore} />
						<Route component={NotFound} />
					</Switch>
				</div>
			</Router>
		);
	}
}

export default App;
export { PropsRoute, PrivateRoute, NotFound };
