import React from "react";
import { Route, Switch } from "react-router";

import Pack from "./containers/Pack";
import EditPack from "./containers/EditPack";
import Generators from "containers/Generators";
import Tables from "containers/Tables";
import NotFound from "components/NotFound";

const routes = [
	{
		path: "/:pack/edit",
		isCreate: false,
		component: Pack
	},
	{
		path: "/:pack",
		isCreate: false,
		exact: false,
		component: Pack,
		routes: [
			{
				path: "/generators",
				component: Generators
			},
			{
				path: "/tables",
				component: Tables
			}
		]
	},
	{
		path: "/create",
		exact: true,
		isCreate: true,
		private: true,
		component: EditPack
	}
];

export default function PackRoutes({}) {
	return (
		<Switch>
			<Route path="/packs/:pack/edit" component={Pack} />
			<Route path="/packs/:pack" component={Pack} />
			<Route component={NotFound} />
		</Switch>
	);
}

export { Pack, routes };
