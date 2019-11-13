import React from "react";
import { Route, Switch } from "react-router";

import Pack from "./containers/Pack";
import EditPack from "./containers/EditPack";
import EditGenerator from "routes/packs/routes/generators/EditGenerator";
import Tables from "containers/Tables";
import EditTable from "routes/tables/containers/EditTable";
import NotFound from "components/NotFound";

const routes = [];

export default function PackRoutes({}) {
	return (
		<Switch>
			<Route path="/packs/:pack/edit" component={Pack} />
			<Route path="/packs/:pack/generators/:generator" component={EditGenerator} />
			<Route path="/packs/:pack/tables/:table/edit" component={EditTable} />
			<Route path="/packs/:pack" component={Pack} />
			<Route component={NotFound} />
		</Switch>
	);
}

export { Pack, routes };
