import { __ } from '@wordpress/i18n';
import Panel from './_panel';

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
			event.stopPropagation();
			if ( event.target.dataset.keywords && 0 < value.length ) {
				addKeyword( group.id, value );
				event.target.value = '';
			}
		}
	};
	return (
		<div className={ 'ui-body-sidebar-list-item-section' }>
			<Panel title={ __( 'Keywords', 'plugin-groups' ) } >
				<KeyWordsList
					group={ group }
					removeKeyword={ removeKeyword }
					addKeyword={ addKeyword }
				/>
				<hr/>
				<input
					className={ 'regular-text keywords-input' }
					type={ 'text' }
					placeholder={ __( 'Add keyword' ) }
					data-keywords={ true }
					onKeyDown={ handleKeyword }/>
			</Panel>
		</div>
	);
}
