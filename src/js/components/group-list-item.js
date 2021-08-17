import GroupNameInput from './group-name-input';

export default function GroupListItem( props ) {
	const {
		selectGroup,
		id,
		changeName,
		editGroup,
		index,
		name,
		selected,
		editing,
		temp,
		activeGroup,
	} = props;

	const handleEdit = ( event ) => {
		event.stopPropagation();
		editGroup( id );
	};
	return (
		<li
			className={ 'ui-body-sidebar-list-item ' + selected }
			id={ index }
			onClick={ ( event ) => selectGroup( id ) }>
					<span className={ 'ui-body-sidebar-list-item-title' }>
						{ ! editing &&
						<>{ name }</>
						}
						{ editing &&
						<GroupNameInput
							temp={ temp }
							name={ name }
							id={ id }
							changeName={ changeName }
							editGroup={ editGroup }
						/>
						}
					</span>
			<span className={ 'ui-body-sidebar-list-item-icons' }>
						<span className={ 'dashicons dashicons-edit' } onClick={ handleEdit }/>
						<span className={ 'dashicons dashicons-trash' }/>
					</span>
		</li>
	);
}
