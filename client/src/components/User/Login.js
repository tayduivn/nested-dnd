import React, { Component } from "react";
import PropTypes from "prop-types";

import "./Login.css";

const Email = ({ email, emailError, handleChange }) => (
	<div className="form-group" name="email">
		<label htmlFor="login_email">Email</label>
		<input
			id="login_email"
			name="email"
			className={`form-control ${emailError ? "is-invalid" : ""}`}
			type="email"
			aria-describedby="emailHelp"
			placeholder="email"
			value={email}
			onChange={handleChange}
			required
		/>
		<small id="emailHelp" className="invalid-feedback">
			{emailError}
		</small>
	</div>
);

const Password = ({ password, passwordError, handleChange, isConfirm }) => (
	<div className="form-group" name="password">
		<label htmlFor={`password${isConfirm ? "_confirm" : ""}`}>Password</label>
		<input
			id={`password${isConfirm ? "_confirm" : ""}`}
			type="password"
			placeholder="password"
			name={`password${isConfirm ? "2" : ""}`}
			className={`form-control ${passwordError ? "is-invalid" : ""}`}
			autoComplete="new-password"
			aria-describedby="pwHelp"
			value={password}
			onChange={handleChange}
			minLength="8"
			required
		/>
		<small id="pwHelp" className="invalid-feedback">
			{passwordError}
		</small>
	</div>
);

const DisplayLogin = ({
	title,
	handleSubmit,
	emailValid,
	handleChange,
	email,
	emailError,
	passwordValid,
	password,
	passwordError,
	password2,
	password2Valid,
	password2Error
}) => (
	<div className="main ">
		<div className="container mt-5 loginForm">
			<h1 className="mb-1"> {title} </h1>
			<form onSubmit={handleSubmit}>
				<Email {...{ email, emailValid, emailError, handleChange }} />
				<Password {...{ password, passwordValid, passwordError, handleChange }} />
				{title === "Login" ? null : (
					<Password {...{ password2, password2Valid, password2Error, handleChange }} />
				)}
				<button type="submit" className="btn btn-primary">
					Submit
				</button>
			</form>
		</div>
	</div>
);

export default class Login extends Component {
	state = {
		email: "",
		password: "",
		password2: "",
		submitted: false
	};

	static propTypes = {
		title: PropTypes.string,
		handleLogin: PropTypes.func,
		loggedIn: PropTypes.bool
	};

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}
	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value,
			[e.target.name + "Valid"]: null,
			[e.target.name + "Error"]: null,
			submitted: false
		});
	}
	handleSubmit(e) {
		e.preventDefault();

		this.props
			.handleLogin(this.props.location.pathname, {
				email: this.state.email,
				password: this.state.password,
				password2: this.state.password2,
				isSignup: this.props.title !== "Login"
			})
			.then(() => this.setState({ submitted: true }));
	}
	render() {
		const error = this.props.error || {};

		return (
			<DisplayLogin
				{...this.props}
				{...this.state}
				{...error}
				handleSubmit={this.handleSubmit}
				handleChange={this.handleChange}
			/>
		);
	}
}
