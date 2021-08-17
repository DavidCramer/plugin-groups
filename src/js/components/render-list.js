import React from 'react';
import GroupListItem from './group-list-item';

export default function RenderList( props ) {
	const {
		activeGroup,
		groups,
		getList,
		edit
	} = props;

	return ( getList().map( ( item, index ) => {
		const { name, id, temp } = groups[ item ];
		const selected = activeGroup === id ? 'active' : '';
		return (
			<GroupListItem
				name={ name }
				id={ id }
				index={ index }
				selected={ selected }
				editing={ id === edit }
				temp={ temp }
				{ ...props }
			/>
		);
	} ) );
}
