import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";

function cleanProps(props) {
	const p = { ...props };
	delete p.location;
	delete p.match;
	delete p.computedMatch;
	delete p.history;
	delete p.exact;
	delete p.path;
	return p;
}

class Private extends React.Component {
	privateRender = routeProps => {
		const { component: Component, redirectTo, path, exact, loggedIn, routes, ...rest } = this.props;
		const props = cleanProps(rest);

		return loggedIn ? (
			<Component routes={routes} {...props} {...routeProps} />
		) : (
			<Redirect
				to={{
					pathname: redirectTo || "/login",
					state: { from: routeProps.location }
				}}
			/>
		);
	};
	render() {
		const { path, exact } = this.props;
		return <Route path={path} exact={exact} render={this.privateRender} props={this.props} />;
	}
}

const PrivateRoute = connect(function mapStateToProps(state) {
	return { loggedIn: state.user.loggedIn };
})(Private);

class PropsRoute extends React.Component {
	renderFunc = (routeProps = {}) => {
		const { component: Component, routes, ...rest } = this.props;
		const props = cleanProps(rest);

		// if this is the login page and we are logged in, redirect
		if (routeProps.location.pathname === "/login" && this.props.loggedIn) {
			const redirectTo = routeProps.location.state && routeProps.location.state.from.pathname;
			return (
				<Redirect
					to={{
						pathname: redirectTo || "/",
						state: { from: routeProps.location }
					}}
				/>
			);
		}

		return <Component routes={routes} {...props} {...routeProps} />;
	};
	render() {
		const { path, exact } = this.props;
		return <Route path={path} exact={exact} render={this.renderFunc} props={this.props} />;
	}
}

// wrap <Route> and use this everywhere instead, then when
// sub routes are added to any route it'll work
const makeSubRoutes = (routes = [], oldpath = "", props) => {
	return routes.map((route, i) => {
		const RouteComponent = route.private ? PrivateRoute : PropsRoute;
		let arr = [];

		if (route.routes) {
			arr = arr.concat(makeSubRoutes(route.routes, oldpath + route.path, props));
		}

		arr.push(
			<RouteComponent
				key={i}
				path={oldpath + route.path}
				exact={route.exact}
				component={route.component}
				routes={route.routes}
				{...props}
			/>
		);

		return arr;
	});
};

export { PrivateRoute, PropsRoute, makeSubRoutes };
