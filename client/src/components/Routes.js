import React from 'react';
import { Route, Redirect } from "react-router-dom";

const renderMergedProps = (component, ...rest) => {
	const finalProps = Object.assign({}, ...rest);
	return React.createElement(component, finalProps);
};

const PrivateRoute = ({ component, redirectTo, ...rest, loggedIn }) => (
	<Route
		{...rest}
		render={routeProps => {
			return loggedIn ? (
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

const PropsRoute = ({ component, ...rest }) => (
	<Route {...rest} render={routeProps => {
			return renderMergedProps(component, routeProps, rest);
		}}
	/>
);



export { PrivateRoute, PropsRoute }