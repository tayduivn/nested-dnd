import React from "react";
import { storiesOf } from "@storybook/react";

import store, { history } from "store";
import ChildAdd from "../ChildAdd";
import StoreProvider from "containers/StoreProvider";

storiesOf("ChildAdd", module).add("default", () => (
	<StoreProvider store={store} history={history}>
		<ChildAdd handleAdd={() => {}} i={1} />
	</StoreProvider>
));
