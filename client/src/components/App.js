import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Nested from "./Nested/Nested.js";
import ThingExplorer from "./ThingExplorer/ThingExplorer.js";
import { IconDebug } from "./ThingExplorer/IconDebug.js";
import Characters from "./Characters/Characters.js";
import Settings from "./Settings.js";

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
						<Link
							className="navbar-brand"
							to={process.env.PUBLIC_URL + "/"}
						>
							Nested D&D
						</Link>
					</div>

					<div
						className="collapse navbar-collapse"
						id="bs-example-navbar-collapse-1"
					>
						<ul className="nav navbar-nav">
							<li>
								<Link to={process.env.PUBLIC_URL + "/nested"}>
									Nested
								</Link>
							</li>
							<li>
								<Link to={process.env.PUBLIC_URL + "/things"}>
									Pack Editor
								</Link>
							</li>
							<li>
								<Link
									to={process.env.PUBLIC_URL + "/characters"}
								>
									Characters
								</Link>
							</li>
						</ul>
						<ul className="nav navbar-nav navbar-right">
							<li>
								<Settings />
								<IconDebug show={false} />
							</li>
						</ul>
					</div>
				</div>
			</nav>
		);
	}
}

class App extends Component {
	constructor(){
		super();
		this.state = {
			response: ""
		};
	}

	componentDidMount() {
		this.callApi()
			.then(res => this.setState({ response: res.express }))
			.catch(err => console.log(err));
	}

	callApi() {
		return fetch("/api/hello")
			.then((response)=>{
				let body = response.json();
				if (response.status !== 200) throw Error(body.message);
				return body;
			})
			.then((json)=>{
				this.setState({"response":JSON.stringify(json)});
			});
	}

	render() {
		return (
			<Router>
				<div className="App">
					<Nav />
					<p className="App-intro">Response: {this.state.response}</p>
					<Switch>
						<Route
							exact
							path={process.env.PUBLIC_URL + "/"}
							component={Nested}
						/>
						<Route
							path={process.env.PUBLIC_URL + "/nested"}
							component={Nested}
						/>
						<Route
							path={process.env.PUBLIC_URL + "/things"}
							component={ThingExplorer}
						/>
						<Route
							path={process.env.PUBLIC_URL + "/characters"}
							component={Characters}
						/>
					</Switch>
				</div>
			</Router>
		);
	}
}

export default App;
