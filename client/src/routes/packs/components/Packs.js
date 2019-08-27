import React from "react";
import "./Packs.scss";

import Page from "components/Page";
import PacksList from "components/PacksList";

// The Page
const Packs = ({ routes, match = {}, ...props }) => (
	<Page id="Packs">
		<PacksList {...props} match={match} />
	</Page>
);

export default Packs;
