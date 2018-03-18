import React, { Component } from "react";
import { Button } from "react-bootstrap";
import DB from "../../actions/CRUDAction";
import PropType from "prop-types";
import { Link } from "react-router-dom";
import { Route } from "react-router-dom";
import { PrivateRoute, PropsRoute, NotFound } from '../App';

import EditGenerator from "./EditGenerator";

const LOADING_GIF = <i className="loading fa fa-spinner fa-spin"></i>;

export default class Generator extends Component {
	static propTypes = {
		mode: PropType.oneOf(["view", "edit", "create"])
	}
	state = {
		generator: null,
		error: null
	}
	componentDidMount() {
		if (this.props.match.params.gen) {
			DB.get("/pack/"+this.props.pack_id+"/generator", this.props.match.params.gen)
				.then(({ error, data })=>{
					this.setState({ generator: data, error: error })
				});
		}
	}
	render() {
		var match = this.props.match.url;

		if(this.state.error) return <div className="alert alert-danger">{this.state.error}</div>

		if (!this.state.generator) return LOADING_GIF;

		return (
			<div>
				<PropsRoute exact path={`${match}`} component={ViewGenerator} generator={this.state.generator} />
				<PrivateRoute path={`${match}/edit`} component={EditGenerator} generator={this.state.generator}  />
			</div>
		)
	}
}

class ViewGenerator extends Component {
	render(){
		const gen = this.props.generator;

		if(!gen) return null;

		return (
			<div className="container">
			
				<Link to={"/packs/"+gen.pack_id}>⬑ Pack</Link>
				<h1>{gen.isa}</h1>
				<ul>
					{Object.keys(gen).map((k,i)=>{
							return (
								<li key={i}><strong>{k}</strong>: { (gen[k] instanceof Object) ? 
									<pre>{JSON.stringify(gen[k],null,2)}</pre> : gen[k] }</li>
							)
						})
					}
				</ul>

				{/* --------- Edit Button ------------ */}
				{this.context.loggedIn ? (
					<Link to={"/packs/" + gen.pack_id + "/generator/"+ gen._id +"/edit"}>
						<Button bsStyle="primary">
							Edit Generator
						</Button>
					</Link>
				) : null}

				

			</div>
		);
	}
}