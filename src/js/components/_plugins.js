export default function PluginGroupPlugins( config ) {
	const { group, plugins, addPlugin } = config;
	const keys = Object.keys( plugins );

	const handleCheck = ( id, plugin ) => {
		addPlugin( id, plugin );
	};

	return ( keys.map( ( item, index ) => {
			const plugin = plugins[ item ];
			const exists = -1 < group.config.plugins.indexOf(
				item ) ? true : false;
			return (
				<div>
					<label>
						<input type={ 'checkbox' } value={ item } checked={ exists } onChange={ () => addPlugin(
							group._id, item ) }/>
						{ plugin.Name } : { plugin.Version }
					</label>
				</div>
			);
		} )
	);
}
