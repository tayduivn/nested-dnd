import React, { Component } from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect
} from "react-router-dom";
import PropTypes from "prop-types";

import Nested from "./Nested/Nested.js";
import ThingExplorer from "./ThingExplorer/ThingExplorer.js";
import Characters from "./Characters/Characters.js";
import Login from "./Login.js";
import Packs from "./Packs/Packs";
import ExplorePack from "./Packs/ExplorePack";
import DB from "../actions/CRUDAction";
import Nav from './Nav';
import Home from './Packs/Home'

import "./App.css";
import "./colors.css";
import "./Nested/textures.css";


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
		return { loggedIn: this.state.loggedIn };
	}
	componentDidMount(){
		DB.fetch("loggedIn").then((result) => {
			this.setState({ loggedIn: result.data.loggedIn })
			return result;
		});
	}
	handleLogin(url, payload){
		return DB.create(url, payload).then((result) => {
			var loggedIn = !result.error && result.data;
			this.setState({ loggedIn: loggedIn });
			return result;
		});
	}
	handleLogout(){
		return DB.fetch('logout', "POST").then((result) => {
			this.setState({ loggedIn: result.data.loggedIn })
			return result;
		});
	}
	render() {
		return (
			<Router>
				<div className="App">
					<Nav handleLogout={this.handleLogout} />
					<Switch>
						<Route
							exact
							path="/"
							component={Home}
						/>
						<Route
							path="/nested"
							component={Nested}
						/>
						<Route
							path="/things"
							component={ThingExplorer}
						/>
						<Route
							path="/characters"
							component={Characters}
						/>
						<PropsRoute
							path="/login"
							component={Login}
							title="Login"
							handleLogin={this.handleLogin}
						/>} />
						<PropsRoute
							path="/signup"
							component={Login}
							title="Signup"
							handleLogin={this.handleLogin}
						/>}

						<PropsRoute path="/packs" component={Packs} />
						
						<Route path="/explore/:packurl" component={ExplorePack} />
						<Route component={NotFound} />

					</Switch>
				</div>
			</Router>
		);
	}
}

const PrivateRoute = ({ component, redirectTo, ...rest }) => {
	return (
		<Route
			{...rest}
			render={routeProps => {
				return this.props.loggedIn ? (
					renderMergedProps(component, routeProps, rest)
				) : (
					<Redirect
						to={{
							pathname: redirectTo,
							state: { from: routeProps.location }
						}}
					/>
				);
			}}
		/>
	);
};

const PropsRoute = ({ component, ...rest }) => {
	return (
		<Route
			{...rest}
			render={routeProps => {
				return renderMergedProps(component, routeProps, rest);
			}}
		/>
	);
};

const renderMergedProps = (component, ...rest) => {
	const finalProps = Object.assign({}, ...rest);
	return React.createElement(component, finalProps);
};

const NotFound = () => (
	<div className="container">
		<h1>404 Not Found</h1>
	</div>
)

export default App;
export { PropsRoute, PrivateRoute, NotFound };
