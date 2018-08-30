import React from 'react';

const HEADERS = {
	credentials: 'include'
};

export default class DDB extends React.Component {

	state = {
		error: undefined,
		html: undefined
	}

	componentDidMount(){
		
	}

	render(){
		return (
			<div dangerouslySetInnerHTML={{__html: this.state.html}}></div>
		)
	}
}