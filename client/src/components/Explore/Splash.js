import React from "react";
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import "./Splash.css"

const nested = {
	url: 'nested',
	in: true,
	cssClass: 'bg-grey-1000 ptn-stardust',
	name: 'Nested',
	font: 'Press Start 2P'
}

const dnd = {
	url: 'dnd',
	in: true,
	cssClass: 'bg-wood-200 ptn-purty-wood',
	name: 'Dungeons & Dragons',
	font: 'IM Fell English SC',
	txt: 'brown'
}

const Pack = ({pack}) => (
	<Link to={{
		pathname: "/explore/"+pack.url,
		state:{
			fromSplash:true,
			current: pack,
			pack: {
				font: pack.font
			}
		}
	}} className={`col-lg ${pack.cssClass} ${pack.url}`}>
		<div>
			<p className="webfont">{pack.name}</p>
		</div>
	</Link>
)

class Splash extends React.Component {
	static contextTypes = {
		loadFonts: PropTypes.func
	}
	componentDidMount(){
		if(this.context.loadFonts)
			this.context.loadFonts([nested.font, dnd.font])
	}
	render(){
		return (
			<div className="container-fluid">
				<div className="row fullscreen">
					<Pack pack={nested} />
					<Pack pack={dnd} />
				</div>
			</div>
		)
	}
}

export default Splash;