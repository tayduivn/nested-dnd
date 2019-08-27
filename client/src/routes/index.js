import React from "react";

import Explore from "routes/explore";
import Packs, { routes as packs } from "routes/packs";
import Map from "routes/map";
import Account from "routes/account";
import Universes, { routes as universes } from "routes/universes";
import PlayersPreview from "routes/players-preview";

export default [
	{
		path: "/account",
		component: Account
	},
	{
		path: "/map",
		component: Map
	},
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
		path: "/players-preview",
		component: PlayersPreview
	},
	{
		path: "/explore/:type/:id",
		component: Explore
	}
];
