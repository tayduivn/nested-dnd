import React, { Component } from "react";
import PropTypes from "prop-types";

import './Login.css'

const DisplayLogin = ({title, handleSubmit, emailVaidation, handleChange, email, emailError, passwordValidation, password, passwordError}) => (
	<div className="main container-fluid loginForm whiteBG">
		<h1 className="mt-5">{title}</h1>
		<form onSubmit={handleSubmit}>
			<div className="form-group" name="email" validationstate={emailVaidation}>
				<label htmlFor="email">Email</label>
				<input id="email" className="form-control" 
					type="email" aria-describedby="emailHelp" placeholder="email" 
					value={email} onChange={handleChange} required />
				<small id="emailHelp">{emailError}</small>
			</div>
			<div className="form-group" name="password" validationstate={passwordValidation}>
				<label htmlFor="password">Password</label>
				<input id="password" type="password" placeholder="password" className="form-control"
					autoComplete="new-password" aria-describedby="pwHelp"
					value={password} 
					onChange={handleChange} 
					minLength="8"
					required />
				<small id="pwHelp">{passwordError}</small>
			</div>
			<button type="submit" className="btn btn-primary">Submit</button>
		</form>
	</div>
);

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


		return <DisplayLogin {...this.props} {...this.state} handleSubmit={this.handleSubmit} handleChange={this.handleChange} />
	}
}