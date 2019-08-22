import React from "react";
import ReactSortable from "react-sortablejs";

import MixedThing from "./MixedThing";

export default class MixedSortable extends React.Component {
	shouldComponentUpdate(nextProps) {
		const changedArray = JSON.stringify(this.props.array) !== JSON.stringify(nextProps.array);
		return changedArray;
	}
	handleSort = (order, sortable, { oldIndex, newIndex }) => {
		const arr = [...this.props.array];

		// do sort
		const temp = arr[newIndex];
		arr[newIndex] = arr[oldIndex];
		arr[oldIndex] = temp;
		this.props.handleChange({
			[this.props.options.property]: arr
		});
	};
	handleChange = changed => {
		const arr = [...this.props.array];
		let index;
		for (index in changed) {
			let newRow = changed[index];
			if (!newRow) {
				arr.splice(index, 1);
			} else arr[index] = newRow;
		}
		this.props.handleChange({ [this.props.options.property]: arr });
	};
	render() {
		const { options = {}, array = [], ...rest } = this.props;
		return (
			<ul className="p-0">
				<ReactSortable options={{ handle: ".handle" }} onChange={this.handleSort}>
					{array &&
						array.map &&
						array.map((c = {}, i) => (
							<MixedThing
								options={{ ...options, sortable: true, property: i }}
								{...c}
								key={(c && c._id) || Math.random()}
								{...{ i, array, ...rest }}
								handleChange={this.handleChange}
							/>
						))}
				</ReactSortable>
			</ul>
		);
	}
}
