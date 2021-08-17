function KeyWordsList( { group, removeKeyword } ) {
	const { id, keywords } = group;

	return ( keywords.map( ( keyword ) => {
			return (
				<button
					type={ 'button' }
					onClick={ () => removeKeyword( id, keyword ) }
				>{ keyword }</button>
			);
		} )
	);
}


export default function PluginGroupKeywords( props ) {
	const { group, addKeyword, removeKeyword } = props;

	const handleKeyword = ( event ) => {
		event.stopPropagation();
		if ( 'Enter' === event.key ) {
			addKeyword( group.id, event.target.value );
			event.target.value = '';
		}
	};

	console.log( group.keywords );
	return (
		<div>
			<h4>Keywords</h4>
			<KeyWordsList
				group={ group }
				removeKeyword={ removeKeyword }
				addKeyword={ addKeyword }
			/>
			<hr/>
			<input
				type={ 'text' }
				placeholder={ 'enter key word' }
				onKeyDown={ handleKeyword }/>
		</div>
	);
}
