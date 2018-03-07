import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel, Button, HelpBlock } from 'react-bootstrap';
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default class Login extends Component {
	static get propTypes() {
		return {
			url: PropTypes.string,
			title: PropTypes.string
		};
	}
	constructor(props){
		super(props);
		this.state = {
			email: "",
			emailVaidation: null,
			emailError: null,
			password: "",
			passwordValidation: null,
			passwordError: null
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}
	handleChange(e){
		this.setState({ [e.target.id]: e.target.value });
	}
	handleSubmit(e){
		var _this = this;
		e.preventDefault();
		const payload = {
			email: this.state.email,
			password: this.state.password
		};
		var data = new FormData();
		data.append( "json", JSON.stringify( payload ) );
		
		fetch('/'+this.props.url,
			{
				method: "POST",
				headers: {
		      'Content-Type': 'application/json'
		    },
				body: JSON.stringify(payload)
			})
			.then((response)=>{
				// not successful, parse the error message
				if(response.status !== 200){
					return response.json();
				}
				// on success, return to wherever you were before
				else{
					return window.location = "/";
				}
			})
			.then((json)=>{
				//only here if errors
				let newState = {
					emailVaidation: (json.emailError) ? "error" : null,
					emailError: json.emailError,
					passwordValidation: (json.passwordError) ? "error" : null,
					passwordError: json.passwordError
				};
				_this.setState(newState);
			});
	}
	render(){
		return (
			<div className="container-fluid loginForm">
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

export class Account extends Component {
	constructor(){
		super()
		this.state = {isLoggedIn: false};
		this.logout = this.logout.bind(this);
	}
	logout(){
		let _this = this;
		fetch('/logout', { credentials: 'include', method: 'post' }).then((response)=>{
			if(response.status == 200){
				_this.setState({ isLoggedIn: false });
			}
			else{
				console.error("Could not log out");
			}
		});
	}
	componentWillMount(){
		fetch("/user", { credentials: 'include' }).then((response)=>{
			if(response.status !== 200){
				this.setState({ isLoggedIn: false });
			}
			else{
				return response.text();
			}
		}).then((json)=>{
			this.setState({ isLoggedIn: json });
		});
	}
	render(){
		return (
			<div>
				{this.state.isLoggedIn ? "Logged in": "Logged out"}
				<Link to={process.env.PUBLIC_URL + "/login"}>Login</Link>
				<a href="#" onClick={this.logout}>Logout</a>
			</div>
		)
		if(!this.state.isLoggedIn){
			return (<Link to={process.env.PUBLIC_URL + "/login"}>Login</Link>);
		}
		else
			return (<a href="#" onClick={this.logout}>Logout</a>);
	}
}