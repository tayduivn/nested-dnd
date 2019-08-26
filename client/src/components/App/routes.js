import React from "react";

import Explore, { PlayersPreview } from "../Explore";
import Packs, { routes as packs } from "../Packs";
import Map from "../Map";
import Account from "../Account";
import Universes, { routes as universes } from "../Universes";

const Characters = React.lazy(() => import("./../Characters"));
const Character = Characters.Character;

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
		path: "/characters",
		component: Characters,
		routes: [
			{
				path: "/:character",
				component: Character
			}
		]
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
