import React from "react";

import { subscribeToPlayersPreview } from '../../actions/WebSocketAction';

export default class PlayersPreview extends React.Component {
	state = {
		src: undefined,
		alt: undefined
	}
	componentDidMount(){
		this.setState({status: "subscribed"});

		subscribeToPlayersPreview((err, {src, alt} = {}) => {
			this.setState({status: "retrieved"});
			this.setState({src,alt});
		});
	}
	render(){
		return (
			<div>
				<img src={this.state.src} alt={this.state.alt} />
			</div>
		);
	}
}