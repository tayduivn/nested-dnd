import Explore from "routes/explore";
import PackRouter from "routes/packs";
import Map from "routes/map";
import Account from "routes/account";
import UniverseRouter from "routes/universes";
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
		component: PackRouter
	},
	{
		path: "/universe",
		component: UniverseRouter,
		private: true
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
