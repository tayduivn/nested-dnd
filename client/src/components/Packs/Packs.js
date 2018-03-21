import React, { Component } from "react";
import { Link, Route } from "react-router-dom";
import PropTypes from "prop-types";

import DB from '../../actions/CRUDAction';
import { PrivateRoute } from '../Routes';
import Pack from './Pack';


import EditPack from "./EditPack";

const LOADING_GIF = <i className="loading fa fa-spinner fa-spin"></i>;

const Packs = ({ match }) => (
	<div className="main mt-5">
		<Route exact path={match.url} component={PackList} />
		<PrivateRoute path={`${match.url}/create`} component={EditPack}  />
		<Route path={`${match.url}/:pack`} component={Pack}  />
	</div>
)

export default Packs;

const PackLink = ({_id, name}) => <li key={_id} ><Link to={"/packs/"+_id}>{name}</Link></li>

const MyPacks = ({myPacks}) => (
	<div>
		<h2>My Packs</h2>
		{myPacks === null ? LOADING_GIF : ""}
		{myPacks && myPacks.length === 0 ? <p>You have not created any packs yet</p>: ""}
		<ul>
			{(myPacks) ? myPacks.map((p)=>PackLink) : null}
		</ul>
		<button className="btn btn-primary" href="/packs/create">Create a New Pack</button>
	</div>
);

class PackList extends Component{
	state = {
			data: null,
			error: null
	}

	static contextTypes = {
		loggedIn: PropTypes.bool
	}

	//fetch data
	componentDidMount(){
		const _t = this;
		DB.fetch("packs").then(result=>{
			_t.setState(result);
		});
	}

	render(){
		const data = this.state.data;
		const publicPacks = data ? data.publicPacks : [];

		return (
			<div className="container">
				<h1>Packs {this.context.loggedIn}</h1>

				{ this.context.loggedIn ? <MyPacks myPacks={data ? data.myPacks : null} /> : null }

				<h2>Public Packs</h2>

				{data === null ? LOADING_GIF : ""}
				<div className={this.state.error ? "alert alert-danger" : ""}>{this.state.error}</div>

				{publicPacks && publicPacks.length === 0 ? <p>There are no public packs to display</p> : null}
				<ul>
					{(publicPacks) ? publicPacks.map((p)=>PackLink) : null}
				</ul>
			</div>
		);
	}
}