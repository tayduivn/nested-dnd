import React from "react";
import { storiesOf } from "@storybook/react";

import openStore, { history } from "store";
import ChildAdd from "../ChildAdd";
import StoreProvider from "containers/StoreProvider";

const store = openStore();

storiesOf("ChildAdd", module).add("default", () => (
	<StoreProvider store={store} history={history}>
		<ChildAdd handleAdd={() => {}} i={1} />
	</StoreProvider>
));
