import React from "react";
import PropTypes from "prop-types";

import IconSelect from '../Form/IconSelect';

const ModalHeader = () => (
	<div className="modal-header">
		<button type="button" className="close" data-dismiss="modal" aria-label="Close">
			<span aria-hidden="true">&times;</span>
		</button>
	</div>
)

export default class IconSelectModal extends React.Component {

	static contextTypes = {
		sendPlayersPreview: PropTypes.func
	}
	state = {
		newValue: null,
		useImg: null,
		showTextBox: null,
	}
	componentDidMount(){
		window.$('#iconSelectModal').on('hide.bs.modal', this.handleClose);
		window.$('#iconSelectModal').on('show.bs.modal', this.handleOpen);
	}
	handleChange = (value) => {
		this.setState({newValue: value});
	}
	handleChangeType = (e) => {
		this.setState({
			useImg: e.target.value==='true',
			showTextBox:  e.target.value==='text',
			newValue: ""
		});
	}
	handleOpen = () => {
		var icon = this.props.icon || "";
		console.log(icon);

		this.setState({
			useImg: !(icon.startsWith("fa") || icon.startsWith("svg ")),
			showTextBox: icon.startsWith("text "),
			newValue: icon.replace("text ","")
		})
	}
	handleClose = () => {
		if(this.state.newValue !== null){
			var newValue = this.state.newValue;
			if(this.state.showTextBox) newValue = "text "+newValue;
			this.props.handleChange(this.props.index, 'icon', newValue);
		}

		if(this.state.useImg !== null)
			this.props.handleChange(this.props.index, 'useImg', this.state.useImg);

		this.setState({newValue: null, useImg: null});
	}
	setPreview = () => {
		var icon = (this.state.newValue !== null) ? this.state.newValue : this.props.icon;
		this.context.sendPlayersPreview(icon);
	}
	render(){
		var {icon, cssClass, style } = this.props;
		var useImg = this.state.useImg;
		var type = (this.state.showTextBox) ? "text" : !!useImg;

		return (
			<div className="modal fade" id="iconSelectModal" tabIndex="-1" role="dialog" aria-hidden="true">
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						<ModalHeader />
						<div className="modal-body">
							<select value={type} className="input-transparent" onChange={this.handleChangeType}>
								<option value={false}>Icon</option>
								<option value="text">Text</option>
								<option value={true}>Image</option>
							</select>
							{ useImg ?
								<div>
									<button className="btn btn-default" onClick={this.setPreview}>Show to players</button>
									<a href="/players-preview">Player view</a>
									<br />
									<img src={icon} alt="Preview" />
									<input className="form-control" value={icon} onChange={(e)=>this.handleChange(e.target.value)} />
								</div>
							: ( this.state.showTextBox ? 
								<div>
									<input className="form-control" value={icon} onChange={(e)=>this.handleChange(e.target.value)} />
								</div>
							: <IconSelect key={this.props.index} status={{isEnabled: true}} 
									value={this.state.newValue} 
									saveProperty={this.handleChange} setPreview={()=>{}}
									{...{cssClass, style}} />
							)}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export { ModalHeader };