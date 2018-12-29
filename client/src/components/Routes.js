import React from "react";
import { Route, Redirect } from "react-router-dom";
import PropTypes from "prop-types";

function cleanProps(props) {
	const p = { ...props };
	delete p.location;
	delete p.match;
	delete p.computedMatch;
	delete p.history;
	return p;
}

const PrivateRoute = ({
	component: Component,
	redirectTo,
	path,
	exact,
	loggedIn,
	routes,
	...rest
}) => {
	const props = cleanProps(rest);
	return (
		<Route
			path={path}
			exact={exact}
			render={routeProps => {
				if (!loggedIn && routeProps.location.pathname.startsWith(path)) {
					console.log(path);
					window.history.pushState({}, "", routeProps.location.pathname);
				}

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
			}}
		/>
	);
};

const PropsRoute = ({ component: Component, path, exact, routes, ...rest }) => {
	const props = cleanProps(rest);
	return (
		<Route
			path={path}
			exact={exact}
			render={routeProps => (
				<Component routes={routes} {...props} {...routeProps} />
			)}
		/>
	);
};

// wrap <Route> and use this everywhere instead, then when
// sub routes are added to any route it'll work
const makeSubRoutes = (routes = [], oldpath = "", props) => {
	return routes.map((route, i) => {
		const RouteComponent = route.private ? PrivateRoute : PropsRoute;
		return (
			<RouteComponent
				key={i}
				path={oldpath + route.path}
				exact={route.exact}
				component={route.component}
				routes={route.routes}
				{...props}
			/>
		);
	});
};

export { PrivateRoute, PropsRoute, makeSubRoutes };
