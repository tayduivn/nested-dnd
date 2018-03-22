import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import DB from "../../actions/CRUDAction";
import Generator from '../Generators/Generator';
import EditGenerator from '../Generators/EditGenerator';
import { PrivateRoute, PropsRoute } from '../Routes';
import EditPack from "./EditPack";

const LOADING_GIF = <i className="loading fa fa-spinner fa-spin"></i>;


/**
 * View a Pack
 */
const ViewPack = ({name, _id, user_id: user, url, defaultSeed, isOwner, public: isPublic, loggedIn, generators}) => (
	<div className="container">
		{/* --------- Name ------------ */}
		<h1>{name}</h1>
		
		{/* --------- Edit Button ------------ */}
		{loggedIn ? (
			<Link to={"/packs/" + _id + "/edit"}>
				<button className="btn btn-primary">
					Edit Pack
				</button>
			</Link>
		) : null}

		<ul>
			{/* --------- Author ------------ */}
			{ !isOwner ? (
				<li>
					<strong>Author: </strong>
					<Link to={"/user/" + user._id}>{user.name}</Link>
				</li>
			) : null}

			{/* --------- Public ------------ */}
			<li>{isPublic ? "Public" : "Private"}</li>
			{url ? <li><Link to={"/explore/"+url}>Explore</Link></li> : null}

			{/* --------- Default Seed ------------ */}
			{defaultSeed ? (
				<li>
					<strong>DefaultSeed: </strong> {defaultSeed}
				</li>
			) : null}

			{/* --------- Dependencies: TODO ------------ */}

		</ul>

		{/* --------- Generators ------------ */}
		<div>
			<h2>Generators</h2>
			<ul>
				{generators.map((gen, i) =>{
					return <li key={i}><Link to={'/packs/'+_id+"/generator/"+gen._id}>{gen.isa} {gen.extends ? '  ('+gen.extends+')' : ""}</Link></li>
				})}
			</ul>

			<Link to={"/packs/" + _id + "/generator/create"}>
				<button className="btn btn-primary">
					Add Generator
				</button>
			</Link>
		</div>

	</div>
)

/**
 * Wrapper Component for Pack pages
 */
export default class Pack extends Component {

	state = {
		pack: null,
		error: null
	};

	static contextTypes = {
		loggedIn: PropTypes.bool
	}

	componentDidMount() {
		var params = this.props.match.params;
		if (params.pack && !params.gen) {
			DB.get("pack", params.pack).then(({error, data}) =>{
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
				<PropsRoute exact path={`${match}`} component={ViewPack} {...this.state.pack} loggedIn={this.context.loggedIn} />
				<PrivateRoute path={`${match}/edit`} component={EditPack} pack={this.state.pack}  />
				<PropsRoute path={`${match}/generator/create`} component={EditGenerator} pack_id={this.props.match.params.pack} />
				<PropsRoute path={`${match}/generator/:gen`} component={Generator} pack_id={this.props.match.params.pack} />
			</div>
		)
		
	}
}

