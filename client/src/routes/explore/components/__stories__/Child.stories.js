import React from "react";
import { storiesOf } from "@storybook/react";
// import { action } from "@storybook/addon-actions";

import Child from "../Child";
import { i_1 } from "__fixtures__/instances.json";

storiesOf("Child", module).add("default", () => (
	<Child hasInArr={false} child={i_1} i={1} tweetDesc={"A short description"} />
));
