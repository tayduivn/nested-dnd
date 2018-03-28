import React from "react";
import { Link } from 'react-router-dom';
import WebFont from 'webfontloader';

import "./Splash.css"

const nested = {
	url: 'nested',
	in: true,
	cssClass: 'black stardust',
	name: 'Nested',
	font: 'Press Start 2P'
}

const dnd = {
	url: 'dnd',
	in: true,
	cssClass: 'burlywood purty-wood',
	name: 'Dungeons & Dragons',
	font: 'IM Fell English SC',
	txt: 'brown'
}

const Pack = ({pack}) => (
	<Link to={{
		pathname: "/explore/"+pack.url,
		state:{
			fromSplash:true,
			current: pack
		}
	}} className={`col-lg ${pack.cssClass} ${pack.url}`}>
		<div>
			<p className="webfont">{pack.name}</p>
		</div>
	</Link>
)

class Splash extends React.Component {
	componentWillMount(){
		WebFont.load({
			google: {
				families: [nested.font, dnd.font]
			}
		})
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