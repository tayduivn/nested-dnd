import React, { Component } from "react";
import { Link, Route } from "react-router-dom";
import PropTypes from "prop-types";

import DB from '../../actions/CRUDAction';
import { PrivateRoute } from '../Routes';
import Pack from './Pack';


import EditPack from "./EditPack";

const LOADING_GIF = <i className="loading fa fa-spinner fa-spin"></i>;

const PackLink = ({_id, name}) => <li><Link to={"/packs/"+_id}>{name}</Link></li>

const MyPacks = ({myPacks}) => (
	<div>
		<h2>My Packs</h2>
		{myPacks === null ? LOADING_GIF : ""}
		{myPacks && myPacks.length === 0 ? <p>You have not created any packs yet</p>: ""}
		<ul>
			{(myPacks) ? myPacks.map((p)=><PackLink key={p._id} {...p} />) : null}
		</ul>
		<button className="btn btn-primary" href="/packs/create">Create a New Pack</button>
	</div>
);

const Display = ({loggedIn, error, data, publicPacks}) => (
	<div className="container mt-5">
		<h1>Packs</h1>

		{ loggedIn ? <MyPacks myPacks={data ? data.myPacks : null} /> : null }

		<h2>Public Packs</h2>

		{data === null ? LOADING_GIF : ""}
		{error ? error.display : null}

		{publicPacks && publicPacks.length === 0 ? <p>There are no public packs to display</p> : null}
		<ul>
			{(publicPacks) ? publicPacks.map(p=><PackLink key={p._id} {...p} />) : null}
		</ul>
	</div>
)

class PackList extends Component{
	state = {
			data: null,
			error: null
	}
	static contextTypes = {
		loggedIn: PropTypes.bool
	}
	componentDidMount(){ //fetch data
		const _t = this;
		DB.fetch("packs").then(result=>{
			_t.setState(result);
		});
	}
	render(){
		return <Display {...this.state} 
			loggedIn={this.context.loggedIn}
			publicPacks={this.state.data ? this.state.data.publicPacks : []} />;
	}
}

const Packs = ({ match }) => (
	<div className="main">
		<Route exact path={match.url} component={PackList} />
		<PrivateRoute path={`${match.url}/create`} component={EditPack}  />
		<Route path={`${match.url}/:pack`} component={Pack}  />
	</div>
)

export default Packs;