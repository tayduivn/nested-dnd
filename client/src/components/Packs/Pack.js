import React, { Component } from "react";
import { Button } from "react-bootstrap";
import AuthService from "../../util/AuthService";
import DB from "../../actions/CRUDAction";
import PropType from "prop-types";
import { Link } from "react-router-dom";

import EditPack from "./EditPack";

/**
 * Wrapper Component for Pack pages
 */
export default class Pack extends Component {
	static get propTypes() {
		return {
			mode: PropType.oneOf(["view", "edit", "create"])
		};
	}
	constructor(props) {
		super(props);
		this.state = {
			pack: null
		};
	}
	componentDidMount() {
		if (this.props.match.params.id) {
			DB.get("pack", this.props.match.params.id).then(({error, data}) =>{
					if(!error)
						this.setState({ pack: data })
				}
			);
		}
	}
	render() {
		var body;

		if (this.props.mode === "create") {
			body = <EditPack isNew={true} history={this.props.history} />;
		} else if (!this.state.pack) {
			body = <p>Loading</p>;
		} else {
			if (this.props.mode === "view")
				body = <ViewPack pack={this.state.pack} />;
			else if (this.props.mode === "edit")
				body = (
					<EditPack
						pack={this.state.pack}
						isNew={false}
						history={this.props.history}
					/>
				);
		}
		return <div className="container">{body}</div>;
	}
}

/**
 * View a Pack
 */
class ViewPack extends Component {
	render() {
		const pack = this.props.pack;

		if(!pack) return null;

		return (
			<div className="container">
				{/* --------- Name ------------ */}
				<h1>{pack.name}</h1>
				
				{/* --------- Edit Button ------------ */}
				{AuthService.isLoggedOn() ? (
					<Link to={"/pack/" + pack._id + "/edit"}>
						<Button bsStyle="primary">
							Edit Pack
						</Button>
					</Link>
				) : null}

				<ul>
					{/* --------- Author ------------ */}
					{ !pack.isOwner ? (
						<li>
							<strong>Author: </strong>
							<Link to={"/user/" + pack._user._id}>{pack._user.name}</Link>
						</li>
					) : null}

					{/* --------- Public ------------ */}
					<li>{pack.public ? "Public" : "Private"}</li>
					{pack.url ? <li><Link to={"/explore/"+pack.url}>Explore</Link></li> : null}

					{/* --------- Default Seed ------------ */}
					{pack.defaultSeed ? (
						<li>
							<strong>DefaultSeed: </strong> {pack.defaultSeed}
						</li>
					) : null}

					{/* --------- Dependencies: TODO ------------ */}

				</ul>

				{/* --------- Generators ------------ */}
				<div>
					<h2>Generators</h2>
					<ul>
						{pack.generators.map((gen, i) =>{
							return <li key={i}><Link to={'/pack/'+pack._id+"/generator/"+gen._id}>{gen.isa} {gen.extends ? '  ('+gen.extends+')' : ""}</Link></li>
						})}
					</ul>

					<Link to={"/pack/" + pack._id + "/generator/create"}>
						<Button bsStyle="primary">
							Add Generator
						</Button>
					</Link>
				</div>

			</div>
		);
	}
}