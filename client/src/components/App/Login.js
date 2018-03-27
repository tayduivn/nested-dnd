import React, { Component } from "react";
import PropTypes from "prop-types";

import './Login.css'

const DisplayLogin = ({title, handleSubmit, emailVaidation, handleChange, email, emailError, passwordValidation, password, passwordError}) => (
	<div className="main mt-5 container-fluid loginForm">
		<h1>{title}</h1>
		<form onSubmit={handleSubmit}>
			<div className="form-group" name="email" validationstate={emailVaidation}>
				<label>Email</label>
				<input type="email" placeholder="email" value={email} onChange={handleChange} required></input>
				<small>{emailError}</small>
			</div>
			<div className="form-group" name="password" validationstate={passwordValidation}>
				<label>Password</label>
				<input type="password" placeholder="password" 
					autoComplete="new-password" 
					value={password} 
					onChange={handleChange} 
					minLength="8"
					required></input>
				<small>{passwordError}</small>
			</div>
			<button type="submit" bsStyle="primary">Submit</button>
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