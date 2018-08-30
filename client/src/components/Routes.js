import React from 'react';
import { Route, Redirect } from "react-router-dom";
import PropTypes from 'prop-types';

const renderMergedProps = (component, props) => {
	const finalProps = Object.assign({}, props);
	if(props.id)	finalProps.key = props.id;

	return React.createElement(component, finalProps);
};

// wrap <Route> and use this everywhere instead, then when
// sub routes are added to any route it'll work
const RouteWithSubRoutes = route => {
	// pass the sub-routes down to keep nesting
	const render =  props => <route.component {...props} routes={route.routes} />
	const RouteComponent = route.private ? PrivateRoute : PropsRoute;
	
	return <RouteComponent {...route} render={render} />
};

class PrivateRoute extends React.Component {
	static contextTypes = {
		loggedIn: PropTypes.bool
	}
	render(){
		return <PrivateRouteDisplay {...this.props} loggedIn={this.context.loggedIn} />
	}
}

const PrivateRouteDisplay = ({ component, redirectTo, path, loggedIn, ...rest }) => (
	<Route
		{...rest}
		render={routeProps => {
			if(!loggedIn && routeProps.location.pathname.startsWith(path)){
				console.log(path)
				window.history.pushState({},"", routeProps.location.pathname)
			}

			return loggedIn ? (
				renderMergedProps(component, {...rest, ...routeProps})
			) : (
				<Redirect
					to={{
						pathname: redirectTo || '/login',
						state: { from: routeProps.location }
					}}
				/>
			);
		}}
	/>
);

const PropsRoute = ({ component, ...rest }) => (
	<Route {...rest} render={routeProps => {
			return renderMergedProps(component, {...rest, ...routeProps});
		}}/>
);

export { PrivateRoute, PropsRoute, RouteWithSubRoutes }