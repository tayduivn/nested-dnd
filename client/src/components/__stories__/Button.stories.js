import React from "react";
import { storiesOf } from "@storybook/react";

import Button, { CloseButton } from "../Button";

storiesOf("Button", module).add("default", () => (
	<>
		<Button>Text</Button>
		<Button variant="contained">Contained</Button>
		<Button variant="outline">Outline</Button>
		<CloseButton />
	</>
));
