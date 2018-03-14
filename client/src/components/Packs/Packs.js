import React, { Component } from "react";
import DB from '../../actions/CRUDAction';
import AuthService from '../../util/AuthService';
import { Button } from 'react-bootstrap';
import { Link } from "react-router-dom";

export default class Packs extends Component{
	constructor(props){
		super(props);
		this.state = {
			myPacks: null,
			publicPacks: null
		}
	}

	//fetch data
	componentDidMount(){
		DB.getAll("packs", (json) => this.setState(json) );
	}

	render(){
		const myPacks = (
			<div>
				<h2>My Packs</h2>
				{this.state.myPacks === null ? <p>Loading</p>: ""}
				{this.state.myPacks && this.state.myPacks.length === 0 ? <p>You have not created any packs yet</p>: ""}
				<ul>
					{(this.state.myPacks)  ? this.state.myPacks.map((p)=>(<li key={p._id} ><Link to={"/pack/"+p._id}>{p.name}</Link></li>)) : null}
				</ul>
				<Button bsStyle="primary" href="/pack/create">Create a New Pack</Button>
			</div>
		)

		return (
			<div className="container">
				<h1>Packs</h1>

				{AuthService.isLoggedOn() ? myPacks : null }

				<h2>Public Packs</h2>
				{this.state.publicPacks === null ? <p>Loading</p>: ""}
				{this.state.publicPacks && this.state.publicPacks.length === 0 ? <p>There are no public packs to display</p> : null}
				<ul>
					{(this.state.publicPacks)  ? this.state.publicPacks.map((p)=>(<li key={p._id} ><Link to={"/pack/"+p._id}>{p.name}</Link></li>)) : null}
				</ul>
			</div>
		);
	}
}