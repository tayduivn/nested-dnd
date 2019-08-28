import Login from "../components/Login";
import { connect } from "react-redux";

const mapStateToProps = (state, ownProps) => ({
	loggedIn: state.user.loggedIn,
	error: state.user.error
});

export default connect(mapStateToProps)(Login);
