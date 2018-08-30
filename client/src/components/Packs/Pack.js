import React, { Component } from "react";
import { Link, Switch } from "react-router-dom";
import PropTypes from 'prop-types';

import DB from "../../actions/CRUDAction";
import { LOADING_GIF } from '../App/App';
import { RouteWithSubRoutes, PropsRoute } from '../Routes';
import Generators from '../Generators/Generators';
import { TablesList } from '../Tables/Tables';

import './Pack.css';

/**
 * View a Pack
 */
const ViewPack = ({name, _id, _user: user = {}, url, defaultSeed, isOwner, public: isPublic, loggedIn, gens = {}, generatorTree, tables = [], font, filters = {}, filteredGens = [], handleFilterToggle = ()=>{}, handleGeneratorToggle = ()=>{}, query, handleQuery, handleRebuild, match }) => (
	<div className="main" id="view-pack">
		<div className="container mt-5">
			{/* --------- Name ------------ */}
			<h1>{name}</h1>
			
			{/* --------- Edit Button ------------ */}
			{!isOwner ? null : (
				<Link to={"/packs/" + _id + "/edit"}>
					<button className="btn btn-primary">
						<i className="fa fa-pencil-alt"/> Edit Pack
					</button>
				</Link>
			)}

			{/* ------- REBUILD ------*/}
			{!isOwner ? null : (
				<button className="btn btn-danger" onClick={handleRebuild}>Rebuild</button>
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

			{/* --------- tabs ------------ */}
			<ul className="nav nav-tabs" id="packComponents" role="tablist">
				<li className="nav-item">
					<a className="nav-link active" id="generators-tab" data-toggle="tab" href="#generators" role="tab" aria-controls="generators" aria-selected="true">Generators</a>
				</li>
				<li className="nav-item">
					<a className="nav-link" id="tables-tab" data-toggle="tab" href="#tables" role="tab" aria-controls="tables" aria-selected="false">Tables</a>
				</li>
			</ul>

			
			<div className="tab-content" id="packComponentsContent">

				{/* --------- Generators ------------ */}
				<div className="tab-pane fade show active" id="generators" role="tabpanel" aria-labelledby="generators-tab">
						<Generators generators={gens} {...{isOwner, match} }/>
				</div>

				{/* --------- Tables ------------ */}
				<div className="tab-pane fade" id="tables" role="tabpanel" aria-labelledby="tables-tab">
					<TablesList {...{tables, isOwner, match}} />
				</div>

			</div>
		</div>
	</div>
)

/**
 * Wrapper Component for Pack pages
 */
export default class Pack extends Component {

	state = {
		pack: null,
		error: null,
	};

	static contextTypes = {
		loggedIn: PropTypes.bool
	}

	componentDidMount() {
		var params = this.props.match.params;
		if (params.pack && !params.gen) {
			DB.get("packs", params.pack).then(({error, data}) =>{
				this.setState({ pack: data, error: error });
			});
		}
	}


	handleRenameGen = () => {
		DB.get("packs", this.props.match.params.pack).then(({error, data}) =>{
			this.setState({ pack: data, error: error })
		});
	}

	handleRebuild = () => {
		const packid = this.props.match.params.pack;
		DB.set("builtpacks", packid+'/rebuild', {}).then(({error, data}) =>{
			this.setState({ error: error })
		});
	}

	render() {
		var showGen = this.props.match.params.gen;
		const baseUrl = this.props.match.path
		const { handleRebuild, handleFilterToggle, handleGeneratorToggle, handleRenameGen } = this;
		const { pack } = this.state;

		if(this.state.error) return this.state.error.display
		if (!this.state.pack && !showGen) return <div className="main"><div className="container mt-5">{LOADING_GIF}</div></div>;

		return (
			<div id="Pack">
				<Switch>
					{this.props.routes.map((route, i) => 
						<RouteWithSubRoutes key={i} {...route} path={baseUrl+route.path} 
							{...{pack, handleRenameGen}} />)}
					<PropsRoute exact path={baseUrl} component={ViewPack} 
						{...this.state.pack} loggedIn={this.context.loggedIn} 
						filters={this.state.filters} filteredGens={this.state.filteredGens} 
						query={this.state.query} handleQuery={this.handleQuery} gens={this.state.pack.generators}
						{...{handleRebuild, handleFilterToggle, handleGeneratorToggle}} />
				</Switch>
			</div>
		)
		
	}
}

