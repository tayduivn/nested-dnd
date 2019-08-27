import React from "react";
import Link from "components/Link";

import { loadFonts } from "store/fonts";

const nested = {
	url: "nested",
	in: true,
	cssClass: "bg-grey-1000 ptn-stardust",
	name: "Nested",
	font: "Press Start 2P",
	inArr: true
};

const dnd = {
	url: "dnd",
	in: true,
	cssClass: "bg-wood-200 ptn-purty-wood",
	name: "Dungeons & Dragons",
	font: "IM Fell English SC",
	txt: "brown",
	inArr: true
};

const Pack = ({ pack }) => (
	<Link
		to={{
			pathname: "/explore/" + pack.url,
			state: {
				fromSplash: true,
				current: pack,
				pack: {
					font: pack.font
				}
			}
		}}
		className={`col-lg ${pack.cssClass} ${pack.url}`}
	>
		<div>
			<p className="webfont">{pack.name}</p>
		</div>
	</Link>
);

class Splash extends React.Component {
	componentDidMount() {
		this.props.dispatch(loadFonts([nested.font, dnd.font]));
	}
	render() {
		return (
			<div className="container-fluid p-0">
				<div className="row fullscreen">
					<Pack pack={nested} />
					<Pack pack={dnd} />
				</div>
			</div>
		);
	}
}

export default Splash;
