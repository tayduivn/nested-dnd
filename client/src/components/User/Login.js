/* eslint-disable max-lines-per-function  */

import React, { Component } from "react";
import PropTypes from "prop-types";

import Alert from "../Util/Alert";
import { doLogin } from "./actions";

import "./Login.css";

class Email extends React.PureComponent {
	state = {
		dirty: false
	};
	handleChange = e => {
		this.setState({ dirty: true });
		this.props.handleChange(e);
	};
	_getClassName = () => {
		const invalid = this.props.emailError ? "is-invalid" : "";
		const dirty = this.state.dirty ? "dirty" : "";
		return `form-control ${invalid} ${dirty}`;
	};
	render() {
		const { email, emailError } = this.props;
		return (
			<div className="form-group" name="email">
				<label htmlFor="login_email">Email</label>
				<input
					id="login_email"
					name="email"
					className={this._getClassName()}
					type="email"
					aria-describedby="emailHelp"
					placeholder="email"
					value={email}
					onChange={this.handleChange}
					required
				/>
				<small id="emailHelp" className="invalid-feedback">
					{emailError}
				</small>
			</div>
		);
	}
}

class Password extends React.PureComponent {
	state = {
		dirty: false
	};
	handleChange = e => {
		this.setState({ dirty: true });
		this.props.handleChange(e);
	};
	_getClassName = () => {
		const invalid = this.props.passwordError ? "is-invalid" : "";
		const dirty = this.state.dirty ? "dirty" : "";
		return `form-control ${invalid} ${dirty}`;
	};
	render() {
		const { password, passwordError, isConfirm } = this.props;

		return (
			<div className="form-group" name="password">
				<label htmlFor={`password${isConfirm ? "_confirm" : ""}`}>Password</label>
				<input
					id={`password${isConfirm ? "_confirm" : ""}`}
					type="password"
					placeholder="password"
					name={`password${isConfirm ? "2" : ""}`}
					className={this._getClassName()}
					autoComplete="new-password"
					aria-describedby="pwHelp"
					value={password}
					onChange={this.handleChange}
					minLength="8"
					required
				/>
				<small id="pwHelp" className="invalid-feedback">
					{passwordError}
				</small>
			</div>
		);
	}
}

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
	password2Error,
	apiError
}) => (
	<div className="main ">
		<div className="container mt-5 loginForm">
			<h1 className="mb-1"> {title} </h1>
			<Alert>{apiError ? apiError.title : null}</Alert>
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
			<a href="/api/auth/spotify">Login with Spotify</a>
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

		this.props.dispatch(
			doLogin(this.props.location.pathname, {
				email: this.state.email,
				password: this.state.password,
				password2: this.state.password2,
				isSignup: this.props.title !== "Login"
			})
		);

		this.setState({ submitted: true });
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
