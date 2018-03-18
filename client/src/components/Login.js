import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel, Button, HelpBlock } from 'react-bootstrap';
import PropTypes from "prop-types";

export default class Login extends Component {
	state = {
		email: "",
		emailVaidation: null,
		emailError: null,
		password: "",
		passwordValidation: null,
		passwordError: null,
		submitted: false
	};

	static get propTypes() {
		return {
			title: PropTypes.string,
			handleLogin: PropTypes.func
		};
	}
	constructor(props){
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}
	handleChange(e){
		this.setState({ [e.target.id]: e.target.value });
	}
	handleSubmit(e){
		e.preventDefault();
		const payload = {
			email: this.state.email,
			password: this.state.password
		};
		
		this.props.handleLogin(this.props.location.pathname, payload)
			.then(({ error, data: json })=>{
				//only here if errors
				let newState = {
					emailVaidation: (json.emailError) ? "error" : null,
					emailError: json.emailError,
					passwordValidation: (json.passwordError) ? "error" : null,
					passwordError: json.passwordError,
					submitted: true
				};
				this.setState(newState);
			});
	}
	render(){

		if(!this.state.emailError && !this.state.passwordError && this.state.submitted){
			this.props.history.goBack();
			return null;
		}


		return (
			<div id="content" className="container-fluid loginForm">
				<h1>{this.props.title}</h1>
				<form onSubmit={this.handleSubmit}>
					<FormGroup controlId="email" validationState={this.state.emailVaidation}>
						<ControlLabel>Email</ControlLabel>
						<FormControl type="email" placeholder="email" value={this.state.email} onChange={this.handleChange} required></FormControl>
						<HelpBlock>{this.state.emailError}</HelpBlock>
					</FormGroup>
					<FormGroup controlId="password" validationState={this.state.passwordValidation}>
						<ControlLabel>Password</ControlLabel>
						<FormControl type="password" placeholder="password" 
							autoComplete="new-password" 
							value={this.state.password} 
							onChange={this.handleChange} 
							minLength="8"
							required></FormControl>
						<HelpBlock>{this.state.passwordError}</HelpBlock>
					</FormGroup>
					<Button type="submit" bsStyle="primary">Submit</Button>
				</form>
			</div>
		);
	}
}