import Panel from './_panel';
import { __ } from '@wordpress/i18n';
import ListItem from './list-item';
import React from 'react';

export default function PluginGroupPlugins( props ) {
	const { group, plugins, removePlugins, removePlugin } = props;
	const [ selected, setSelected ] = React.useState( [] );
	const hasPlugins = 0 < group.plugins.length;
	const toggleAll = ( event ) => {
		if ( event.target.checked ) {
			setSelected( group.plugins );
		} else {
			setSelected( [] );
		}
	};
	const removeSelected = ( event ) => {

		removePlugins( group.id, [ ...selected ] );
	};
	const handleCheck = ( event ) => {
		const newSelection = [ ...selected ];

		if ( event.target.checked ) {
			newSelection.push( event.target.value );
		} else {
			newSelection.splice(
				newSelection.indexOf( event.target.value ), 1 );
		}
		setSelected( newSelection );
	};
	return (
		<Panel title={ __( 'Grouped plugins', props.slug ) }>
			{ hasPlugins &&
			<>
				<ListItem
					name={ __( 'Select All', props.slug ) }
					className={ 'list-control' }
					callback={ toggleAll }
					checked={ selected.length === group.plugins.length }
				>
					<button disabled={ ! selected.length }
					        type={ 'button' }
					        className={ 'button' }
					        onClick={ removeSelected }
					>
						{ __( 'Remove selected', props.slug ) }
					</button>

				</ListItem>
				<div className={ 'ui-body-edit-plugins' }>
					{ group.plugins.map( ( item, index ) => {
						const plugin = plugins[ item ] ? plugins[ item ] : {
							Name: item.split('/')[0],
							Version: __('Missing', 'plugin-groups'),
							missing: true,
						};

						return (
							<ListItem name={ plugin.Name }
							          version={ plugin.Version }
							          checked={ -1 < selected.indexOf( item ) }
							          id={ item }
							          key={ item }
							          callback={ handleCheck }
							>
								<label
									className="dashicons dashicons-no-alt"
									onClick={ () => removePlugin(
										group.id, item ) }
								/>
							</ListItem>
						);

					} ) }
				</div>

			</>
			}
			{ ! hasPlugins &&
			<div className={ 'ui-body-edit-plugins' }>
			<span className={ 'ui-body-edit-plugins-item' }>{ __(
				'No plugins selected', props.slug ) }</span>
			</div>
			}
		</Panel>
	);
}
