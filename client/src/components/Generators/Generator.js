import React, { Component } from "react";
import { Button } from "react-bootstrap";
import AuthService from "../../util/AuthService";
import DB from "../../actions/CRUDAction";
import PropType from "prop-types";
import { Link } from "react-router-dom";

import EditGenerator from "./EditGenerator";

export default class Generator extends Component {
	static get propTypes() {
		return {
			mode: PropType.oneOf(["view", "edit", "create"])
		};
	}
	constructor(props) {
		super(props);
		this.state = {
			generator: null
		};
	}
	componentDidMount() {
		if (this.props.match.params.id) {
			DB.get("/pack/"+this.props.match.params.pack+"/generator", this.props.match.params.id)
				.then(({ error, data })=>{
					this.setState({ generator: data })
				});
		}
	}
	render() {
		var body;
		var packid = this.props.match.params.pack;

		if (this.props.mode === "create") {
			body = <EditGenerator isNew={true} history={this.props.history} packid={packid} />;
		} else if (!this.state.generator) {
			body = <p>Loading</p>;
		} else {
			if (this.props.mode === "view")
				body = <ViewGenerator generator={this.state.generator} packid={packid} />;
			else if (this.props.mode === "edit")
				body = (
					<EditGenerator
						generator={this.state.generator}
						isNew={false}
						history={this.props.history}
						packid={packid}
					/>
				);
		}
		return <div className="container">{body}</div>;
	}
}

class ViewGenerator extends Component {
	render(){
		const gen = this.props.generator;

		if(!gen) return null;

		return (
			<div className="container">
			
				<Link to={"/pack/"+gen.pack_id}>⬑ Pack</Link>
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
				{AuthService.isLoggedOn() ? (
					<Link to={"/pack/" + gen.pack_id + "/generator/"+ gen._id +"/edit"}>
						<Button bsStyle="primary">
							Edit Generator
						</Button>
					</Link>
				) : null}

				

			</div>
		);
	}
}