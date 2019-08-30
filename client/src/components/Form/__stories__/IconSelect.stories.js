import React, { useState } from "react";
import { storiesOf } from "@storybook/react";

import IconSelect from "../IconSelect";

function IconSelectWrapper(props) {
	const [icon, setIcon] = useState({});

	const handleChange = function(value) {
		setIcon(value);
	};

	return <IconSelect {...props} saveProperty={handleChange} value={icon} />;
}

storiesOf("IconSelect", module).add("single", () => <IconSelectWrapper />);
