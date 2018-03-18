import React, { Component } from "react";
import { Button } from "react-bootstrap";
import DB from "../../actions/CRUDAction";
import { Route } from "react-router-dom";
import Generator from '../Generators/Generator';
import EditGenerator from '../Generators/EditGenerator';
import { PrivateRoute, PropsRoute } from '../App';
import { Link } from "react-router-dom";

import EditPack from "./EditPack";

const LOADING_GIF = <i className="loading fa fa-spinner fa-spin"></i>;

/**
 * Wrapper Component for Pack pages
 */
export default class Pack extends Component {

	state = {
		pack: null,
		error: null
	};

	componentDidMount() {
		if (this.props.match.params.pack && !this.props.match.params.gen) {
			DB.get("pack", this.props.match.params.pack).then(({error, data}) =>{
					this.setState({ pack: data, error: error })
				}
			);
		}
	}
	render() {
		var match = this.props.match.url;
		var showGen = this.props.match.params.gen;

		if(this.state.error) return <div className="alert alert-danger">{this.state.error}</div>
		if (!this.state.pack && !showGen) return LOADING_GIF;

		return (
			<div>
				<PropsRoute exact path={`${match}`} component={ViewPack} pack={this.state.pack} />
				<PrivateRoute path={`${match}/edit`} component={EditPack} pack={this.state.pack}  />
				<PropsRoute path={`${match}/generator/create`} component={EditGenerator} pack_id={this.props.match.params.pack} />
				<PropsRoute path={`${match}/generator/:gen`} component={Generator} pack_id={this.props.match.params.pack} />
			</div>
		)
		
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
				{this.props.loggedIn ? (
					<Link to={"/packs/" + pack._id + "/edit"}>
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
							return <li key={i}><Link to={'/packs/'+pack._id+"/generator/"+gen._id}>{gen.isa} {gen.extends ? '  ('+gen.extends+')' : ""}</Link></li>
						})}
					</ul>

					<Link to={"/packs/" + pack._id + "/generator/create"}>
						<Button bsStyle="primary">
							Add Generator
						</Button>
					</Link>
				</div>

			</div>
		);
	}
}