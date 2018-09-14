import React from "react";
import PropTypes from "prop-types";

export default class PlayersPreview extends React.Component {
	static propTypes = {
		subscribeToPlayersPreview: PropTypes.func
	}
	state = {
		src: undefined,
		alt: undefined
	}
	componentDidMount(){
		this.setState({status: "subscribed"});

		this.props.subscribeToPlayersPreview((err, {src, alt} = {}) => {
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