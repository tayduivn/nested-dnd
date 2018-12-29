import React, { Component } from "react";
import { Switch, Route, BrowserRouter } from "react-router-dom";

import { Login } from "../User";
import Nav from "./Nav";
import Characters, { Character } from "../Characters";
import Explore, { Splash, PlayersPreview } from "../Explore";
import Packs, { routes as packs } from "../Packs";
import { PropsRoute, makeSubRoutes } from "../Routes";
import Universes, { routes as universes } from "../Universes";

import DB from "../../actions/CRUDAction";

import {
	sendPlayersPreview,
	subscribeToPlayersPreview
} from "../../actions/WebSocketAction";

import "./App.css";

// monkey patch
/*if (process.env.NODE_ENV !== "production") {
	const { whyDidYouUpdate } = require("why-did-you-update");
	whyDidYouUpdate(React);
}*/

const NotFound = () => (
	<div className="main">
		<div className="container mt-5">
			<h1>404 Not Found</h1>
		</div>
	</div>
);

const LOADING_GIF = <i className="loading fa fa-spinner fa-spin" />;

const routes = [
	{
		path: "/packs",
		component: Packs,
		routes: packs
	},
	{
		path: "/universes",
		component: Universes,
		private: true,
		routes: universes
	},
	{
		path: "/characters",
		component: Characters,
		routes: [
			{
				path: "/:character",
				component: Character
			}
		]
	},
	{
		path: "/players-preview",
		component: PlayersPreview,
		subscribeToPlayersPreview: subscribeToPlayersPreview
	},
	{
		path: "/explore/:packurl",
		component: Explore
	}
];

export default class App extends Component {
	constructor(props) {
		super(props);
		this.handleLogin = this.handleLogin.bind(this);
		this.handleLogout = this.handleLogout.bind(this);
	}

	sendPlayersPreview = icon => sendPlayersPreview({ src: icon });

	shouldComponentUpdate(nextProps, nextState) {
		const newProps = nextProps !== this.props;
		const changedLoggedIn = nextProps.loggedIn !== this.props.loggedIn;
		return newProps || changedLoggedIn;
	}
	handleLogin(url, payload) {
		return DB.create(url, payload).then(result => {
			var loggedIn = !result.error && result.data;
			this.setState({ loggedIn: !!loggedIn });
			return result;
		});
	}
	handleLogout() {
		return DB.fetch("logout", "POST").then(result => {
			this.setState({ loggedIn: !!result.data.loggedIn });
			return result;
		});
	}
	render() {
		const { loggedIn, loadFonts } = this.props;
		return (
			<BrowserRouter>
				<div className="app">
					<Switch>
						<Route exact path="/players-preview" />
						<PropsRoute
							component={Nav}
							handleLogout={this.handleLogout}
							loggedIn={loggedIn}
						/>
					</Switch>
					{loggedIn !== null ? (
						<Switch>
							<PropsRoute
								exact
								path="/"
								component={loggedIn ? Universes : Splash}
								loadFonts={loadFonts}
								loggedIn={loggedIn}
							/>
							{makeSubRoutes(routes, "", { loggedIn, loadFonts })}
							<PropsRoute
								path="/login"
								component={Login}
								title="Login"
								handleLogin={this.handleLogin}
								loggedIn={loggedIn}
							/>
							<PropsRoute
								path="/signup"
								component={Login}
								title="Sign up"
								handleLogin={this.handleLogin}
								loggedIn={loggedIn}
							/>
							<Route component={NotFound} />
						</Switch>
					) : null}
				</div>
			</BrowserRouter>
		);
	}
}

export { NotFound, LOADING_GIF };
