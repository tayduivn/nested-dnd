import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import PropTypes from "prop-types";
import WebFont from "webfontloader";
import { Provider } from "react-redux";

import Login from "./Login";
import Nav from "./Nav";
import Characters, { Character } from "../Characters";
import Explore, { Splash, PlayersPreview } from "../Explore";
import Packs, { routes as packs } from "../Packs";
import { PropsRoute, RouteWithSubRoutes } from "../Routes";
import Universes, { routes as universes } from "../Universes";

import DB from "../../actions/CRUDAction";
import store from "./store";

import {
	sendPlayersPreview,
	subscribeToPlayersPreview
} from "../../actions/WebSocketAction";

import "./App.css";

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

class App extends Component {
	constructor() {
		super();
		this.state = {
			loggedIn: undefined,
			loadedFonts: []
		};
		this.handleLogin = this.handleLogin.bind(this);
		this.handleLogout = this.handleLogout.bind(this);
		this.handleLoadFonts = this.handleLoadFonts.bind(this);
	}
	static get childContextTypes() {
		return {
			loggedIn: PropTypes.bool,
			loadFonts: PropTypes.func,
			sendPlayersPreview: PropTypes.func
		};
	}
	getChildContext() {
		return {
			loggedIn: !!this.state.loggedIn,
			loadFonts: this.handleLoadFonts,
			sendPlayersPreview: this.sendPlayersPreview
		};
	}
	sendPlayersPreview = icon => sendPlayersPreview({ src: icon });
	handleLoadFonts(fonts = [], source = "google") {
		if (!fonts) return;
		if (!(fonts instanceof Array)) fonts = [fonts];
		if (!fonts.length) return;

		const lf = this.state.loadedFonts;

		// remove fonts already loaded
		fonts = fonts.filter(f => !lf.includes(f));

		if (!fonts.length) return;

		WebFont.load({
			[source]: {
				families: fonts
			}
		});

		this.setState({ loadedFonts: lf.concat(fonts) });
	}
	componentDidMount() {
		DB.fetch("loggedIn").then(result => {
			if (result.data) this.setState({ loggedIn: !!result.data.loggedIn });
		});
	}
	shouldComponentUpdate(nextProps, nextState) {
		const newProps = nextProps !== this.props;
		const changedLoggedIn = nextState.loggedIn !== this.state.loggedIn;
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
		return (
			<Provider store={store}>
				<Router>
					<div className="app">
						<Switch>
							<Route exact path="/players-preview" />
							<PropsRoute component={Nav} handleLogout={this.handleLogout} />
						</Switch>
						{this.state.loggedIn !== undefined ? (
							<Switch>
								<Route
									exact
									path="/"
									component={this.state.loggedIn ? Universes : Splash}
								/>
								{routes.map((route, i) => (
									<RouteWithSubRoutes key={i} {...route} />
								))}
								<PropsRoute
									path="/login"
									component={Login}
									title="Login"
									handleLogin={this.handleLogin}
								/>
								<PropsRoute
									path="/signup"
									component={Login}
									title="Sign up"
									handleLogin={this.handleLogin}
								/>
								<Route component={NotFound} />
							</Switch>
						) : null}
					</div>
				</Router>
			</Provider>
		);
	}
}

export default App;
export { NotFound, LOADING_GIF };
