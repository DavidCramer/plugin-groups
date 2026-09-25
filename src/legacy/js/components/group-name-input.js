export default function GroupNameInput( props ) {

	const { name, id, changeName, editGroup, temp, focus } = props;
	const handleChange = ( event ) => {
		changeName( id, event.target.value );
	};
	const checkName = ( event ) => {
		if ( ! event.target.value.length ) {
			event.target.focus();
		} else if ( event.target.value.length && '/' !== event.target.value ) {
			editGroup( id );
		}
	};

	return (
		<input
			className={ 'ui-body-edit-title' }
			autoFocus={ focus }
			onFocus={ ( event ) => {event.target.select()} }
			value={ name }
			onInput={ handleChange }
			onBlur={ checkName }
			type={ 'text' }
			data-edit={ id }
		/>
	);
}
