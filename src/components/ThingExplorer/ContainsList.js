import React from 'react';
import { FormGroup, FormControl, InputGroup, Button } from 'react-bootstrap';

import thingStore from '../../stores/thingStore';

class EditableInput extends React.Component{
	render(){
		var children = React.Children.map(this.props.children,
     (child) => React.cloneElement(child, {
       disabled: this.props.disabled
     })
    );

		return (
			(<InputGroup>
				<InputGroup.Button onClick={(e) => this.props.handleClick(e, this.props.disabled) }>
						{this.props.disabled ? (<Button><i className="fa fa-pencil"></i> Edit</Button>) 
							: <Button ><i className="fa fa-times"></i> reset</Button>}
				</InputGroup.Button>
				{children}
			</InputGroup>)
		)
	}
}

class ContainsList extends React.Component {
	getList(){
		return this.props.list.map((item, index) => {
				var type = (item === "") ? "" 
				: (item.roll) ? "Table" 
				: (typeof item !== "string") ? "embedded thing"
				: (thingStore.exists(item)) ? "thing" : "text";

			var value = (typeof item === "string") ? item : JSON.stringify(item);

			return (<InputGroup key={index}>
				<InputGroup.Addon className="btn btn-danger" value={undefined} name="contains" onClick={(e)=>{ this.props.handleChange(e, index); }}>
					<span  >
						<i className="fa fa-times" />
					</span>
				</InputGroup.Addon>
				<FormControl onChange={(e) => this.props.handleChange(e, index)}
					name="contains" type="text"
					componentClass="textarea" rows={(value) ? Math.ceil(value.length/50) : 1}
					value={value} 
					disabled={false} />
				<InputGroup.Addon>
					<em>{type}</em>
				</InputGroup.Addon>
			</InputGroup>)
		});
	}
	render(){
		return(<FormGroup>
				<label>Contains</label>
				{this.getList()}
				<br/>
				<div className={this.props.list.length ? "":"pull-right"}>
					<Button name="contains" 
						onClick={(e)=> this.props.handleChange(e,this.props.list.length)}>
						<i className="fa fa-plus"></i> Add Another</Button>
				</div>
		</FormGroup>)
	}
}

export default ContainsList;
export { EditableInput }