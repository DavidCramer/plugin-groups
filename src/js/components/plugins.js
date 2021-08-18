import Panel from './_panel';
import { __ } from '@wordpress/i18n';

export default function PluginGroupPlugins( props ) {
	const { group, plugins, removePlugin } = props;

	return (
		<div className={ 'ui-body-edit-plugins' }>
			<Panel title={__('Grouped plugins', props.slug ) } >
			{ group.plugins.map( ( item, index ) => {
				const plugin = plugins[ item ];

				return (

					<span className={ 'ui-body-edit-plugins-item' }>
						<span>
							{ plugin.Name } : { plugin.Version }
						</span>
						<label
							className="dashicons dashicons-no-alt"
							onClick={ () => removePlugin( group.id, item ) }
						/>
					</span>
				);
			} ) }
			</Panel>
		</div>
	);
}
