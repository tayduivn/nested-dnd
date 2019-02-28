import React from "react";

const caps = str => str.toUpperCase().trim();

class Isa extends React.PureComponent {
	render() {
		const { name, isa } = this.props;

		if (!isa || !name) return null;
		const capName = caps(name);
		const capIsa = caps(isa);

		if (
			name &&
			capName !== capIsa &&
			!capName.endsWith(capIsa) &&
			!capIsa.endsWith(capName) &&
			!capName.startsWith(capIsa) &&
			!capIsa.startsWith(capName)
		) {
			return <h2 className="child__isa">{isa}</h2>;
		}

		return null;
	}
}

export default Isa;
