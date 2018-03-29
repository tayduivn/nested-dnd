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
const ViewPack = ({name, _id, _user: user, url, defaultSeed, isOwner, public: isPublic, loggedIn, generators, font}) => (
	<div className="container">
		{/* --------- Name ------------ */}
		<h1>{name}</h1>
		
		{/* --------- Edit Button ------------ */}
		{!isOwner ? null : (
			<Link to={"/packs/" + _id + "/edit"}>
				<button className="btn btn-primary">
					Edit Pack
				</button>
			</Link>
		)}

		<ul>
			{/* --------- Author ------------ */}
			{ isOwner ? null : (
				<li>
					<strong>Author: </strong>
					<Link to={"/user/" + user._id}>{user.name}</Link>
				</li>
			)}

			{/* --------- Public ------------ */}
			<li>{isPublic ? "Public" : "Private"}</li>
			{url ? <li><Link to={"/explore/"+url}>Explore</Link></li> : null}

			{/* --------- Font ------------ */}
			<li>Font: {font}</li>

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
			{ !isOwner ? null :
				<Link to={"/packs/" + _id + "/generators/create"}>
					<button className="btn btn-primary">
						Add Generator
					</button>
				</Link>
			}
			<ul>
				{generators.map((gen, i) =>{
					return <li key={i}><Link to={'/packs/'+_id+"/generators/"+gen._id}>{gen.isa} {gen.extends ? '  ('+gen.extends+')' : ""}</Link></li>
				})}
			</ul>
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
			DB.get("packs", params.pack).then(({error, data}) =>{
				this.setState({ pack: data, error: error })
			});
		}
	}
	render() {
		var match = this.props.match.url;
		var showGen = this.props.match.params.gen;

		if(this.state.error) return this.state.error.display
		if (!this.state.pack && !showGen) return LOADING_GIF;

		return (
			<div  className="mt-5">
				<PropsRoute exact path={`${match}`} component={ViewPack} {...this.state.pack} loggedIn={this.context.loggedIn} />
				<PrivateRoute path={`${match}/edit`} component={EditPack} pack={this.state.pack} redirectTo="/login" loggedIn={this.context.loggedIn} />
				<PropsRoute path={`${match}/generators/create`} component={EditGenerator} pack_id={this.props.match.params.pack} />
				<PropsRoute path={`${match}/generators/:gen`} component={Generator} pack_id={this.props.match.params.pack} />
			</div>
		)
		
	}
}

