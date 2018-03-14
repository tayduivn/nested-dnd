import React, { Component } from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	Redirect
} from "react-router-dom";

import Nested from "./Nested/Nested.js";
import ThingExplorer from "./ThingExplorer/ThingExplorer.js";
import { IconDebug } from "./ThingExplorer/IconDebug.js";
import Characters from "./Characters/Characters.js";
import Settings from "./Settings.js";
import Login, { Account } from "./Login.js";

import Packs from "./Packs/Packs";
import Pack from "./Packs/Pack";
import ExplorePack from "./Packs/ExplorePack";
import AuthService from "../util/AuthService";

import Generator from './Generators/Generator';

import "./App.css";
import "./colors.css";

class Nav extends Component {
	render() {
		return (
			<nav className="navbar navbar-default navbar-fixed-top">
				<div className="container-fluid">
					<div className="navbar-header">
						<button
							type="button"
							className="navbar-toggle collapsed"
							data-toggle="collapse"
							data-target="#bs-example-navbar-collapse-1"
							aria-expanded="false"
						>
							<span className="sr-only">Toggle navigation</span>
							<span className="icon-bar" />
							<span className="icon-bar" />
							<span className="icon-bar" />
						</button>
						<Link className="navbar-brand" to={process.env.PUBLIC_URL + "/"}>
							Nested D&D
						</Link>
					</div>

					<div
						className="collapse navbar-collapse"
						id="bs-example-navbar-collapse-1"
					>
						<ul className="nav navbar-nav">
							<li>
								<Link to={process.env.PUBLIC_URL + "/nested"}>Nested</Link>
							</li>
							<li>
								<Link to={process.env.PUBLIC_URL + "/things"}>Pack Editor</Link>
							</li>
							<li>
								<Link to={process.env.PUBLIC_URL + "/characters"}>
									Characters
								</Link>
							</li>
							<li>
								<Link to={process.env.PUBLIC_URL + "/packs"}>Packs</Link>
							</li>
						</ul>
						<ul className="nav navbar-nav navbar-right">
							<li>
								<Settings />
								<IconDebug show={false} />
							</li>
							<li>
								<Account />
							</li>
						</ul>
					</div>
				</div>
			</nav>
		);
	}
}

class App extends Component {
	render() {
		return (
			<Router>
				<div className="App">
					<Nav />
					<Switch>
						<Route
							exact
							path="/"
							component={Nested}
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
							url="login"
						/>} />
						<PropsRoute
							path="/signup"
							component={Login}
							title="Signup"
							url="signup"
						/>}

						<PrivateRoute path="/pack/:pack/generator/create" component={Generator} mode="create" />
						<PrivateRoute path="/pack/:pack/generator/:id/edit" component={Generator} mode="edit" />
						<PropsRoute path="/pack/:pack/generator/:id" component={Generator} mode="view" />

						<PrivateRoute path="/pack/create" component={Pack} mode="create" />
						<PrivateRoute path="/pack/:id/edit" component={Pack} mode="edit" />
						<PropsRoute path="/pack/:id" component={Pack} mode="view" />
						<Route path="/packs" component={Packs} />
						<Route path="/explore/:packurl" component={ExplorePack} />

						

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
				return AuthService.isLoggedOn() ? (
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

export default App;
