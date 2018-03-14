import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel, Button, HelpBlock } from 'react-bootstrap';
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import AuthService from '../util/AuthService';

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
		
		fetch('/api/'+this.props.url,
			{
				credentials: 'include',
				method: "POST",
				headers: {
		      'Content-Type': 'application/json',
		      "Accept": "application/json"
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
					AuthService.setLoggedOn(true);
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
		this.state = { isLoggedOn: AuthService.isLoggedOn() };
		this.logout = this.logout.bind(this);
	}
	logout(){
		AuthService.logOff((bool) => this.setState({ isLoggedOn: bool }));
	}
	componentWillMount(){
		AuthService.checkLoggedOn((bool) => this.setState({ isLoggedOn: bool }));
	}
	render(){
		if(this.state.isLoggedOn === null){
			return null;
		}
		else if(!this.state.isLoggedOn){
			return (<Link to={process.env.PUBLIC_URL + "/login"}>Login</Link>);
		}
		else
			return (<Link to="#" onClick={this.logout}>Logout</Link>);
	}
}