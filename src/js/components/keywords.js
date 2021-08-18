import { __ } from '@wordpress/i18n';

function KeyWordsList( { group, removeKeyword } ) {
	const { id, keywords } = group;

	return ( keywords.map( ( keyword ) => {
			return (
				<span className={ 'ui-keyword' }>{ keyword }
					<label
						className="dashicons dashicons-no-alt"
						onClick={ () => removeKeyword( id, keyword ) }
					/>
				</span>
			);
		} )
	);
}


export default function PluginGroupKeywords( props ) {
	const { group, addKeyword, removeKeyword } = props;

	const handleKeyword = ( event ) => {
		const value = event.target.value.trim();
		if ( 'Enter' === event.key || ',' === event.key ) {
			event.preventDefault();
			if( event.target.dataset.keywords && 0 < value.length ){
				event.stopPropagation();
				addKeyword( group.id, value );
				event.target.value = '';
			}
		}
	};
	return (
		<div className={ 'ui-body-sidebar-list-item-keywords' }>
			<strong>Keywords:</strong>
			<KeyWordsList
				group={ group }
				removeKeyword={ removeKeyword }
				addKeyword={ addKeyword }
			/>
			<hr/>
			<input
				className={ 'regular-text' }
				type={ 'text' }
				placeholder={ __( 'Add keyword' ) }
				data-keywords={ true }
				onKeyDown={ handleKeyword }/>
		</div>
	);
}
