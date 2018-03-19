import React from 'react';
import { Route, Redirect } from "react-router-dom";

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



export { PrivateRoute, PropsRoute }