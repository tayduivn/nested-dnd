import React from "react";
import CreateUniverse from "./components/CreateUniverse";
import EditUniverse from "./containers/EditUniverse";
import Universes from "./containers/Universes";
import { Route, Switch } from "react-router";
import NotFound from "components/NotFound";

export default function Router() {
	return (
		<Switch>
			<Route path="/universe/:universe/create" component={CreateUniverse} />
			<Route path="/universe/:universe/edit" component={EditUniverse} />
			<Route component={NotFound} />
		</Switch>
	);
}

export { Universes, CreateUniverse, EditUniverse };
