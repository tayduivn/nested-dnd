import React, { Component } from "react";
import { Route, Switch } from "react-router";
import { connect } from "react-redux";

import Login from "routes/login";
import Nav from "routes/Nav";
import Splash from "routes/Splash";
import { PropsRoute, makeSubRoutes } from "./containers/Routes";
import { Universes } from "routes/universes";
import NotFound from "./components/NotFound";
import Snackbar from "routes/Snackbar";

import routes from "./routes";
import { sendPlayersPreview } from "store/actions";
import "./App.scss";

class App extends Component {
	sendPlayersPreview = icon => sendPlayersPreview({ src: icon });

	shouldComponentUpdate(nextProps, nextState) {
		const newProps = nextProps !== this.props;
		const changedLoggedIn = nextProps.loggedIn !== this.props.loggedIn;
		return newProps || changedLoggedIn;
	}

	render() {
		const { loggedIn, logOutError } = this.props;
		return (
			<div id="App" className="app">
				<Switch>
					<Route exact path="/players-preview" />
					<PropsRoute component={Nav} {...{ loggedIn, logOutError }} />
				</Switch>
				{loggedIn !== null ? (
					<Switch>
						<PropsRoute
							component={loggedIn ? Universes : Splash}
							{...{ exact: true, path: "/", loggedIn }}
						/>
						{makeSubRoutes(routes, "", { loggedIn })}
						<PropsRoute path="/login" component={Login} title="Login" loggedIn={loggedIn} />
						<PropsRoute path="/signup" component={Login} title="Sign up" loggedIn={loggedIn} />
						<Route component={NotFound} />
					</Switch>
				) : null}
				<Snackbar />
			</div>
		);
	}
}

const mapStateToProps = state => ({
	loggedIn: state.user.loggedIn,
	logOutError: state.user.logOutError
});

export default connect(mapStateToProps)(App);