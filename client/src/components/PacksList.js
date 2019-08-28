import React from "react";

import PackUL from "./PackUL";
import Loading from "components/Loading";

const MyPacks = ({ myPacks = [] }) => (
	<div>
		<h2>My Packs</h2>
		{myPacks === null && Loading.Icon}
		{myPacks && myPacks.length === 0 && <p>You have not created any packs yet</p>}
		{myPacks && <PackUL list={myPacks} addButton={true} />}
	</div>
);

// List my and public packs
const PacksList = ({ loggedIn, error, myPacks, publicPacks }) => (
	<div id="Packs > PacksList">
		{loggedIn && <MyPacks myPacks={myPacks} />}

		<h2>Public Packs</h2>

		{myPacks === null && Loading.Icon}
		{error && error.display}

		{publicPacks && publicPacks.length === 0 && <p>There are no public packs to display</p>}
		{publicPacks && <PackUL list={publicPacks} />}
	</div>
);

export default PacksList;
