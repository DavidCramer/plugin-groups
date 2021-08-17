export default function PluginGroupPlugins( props ) {
	const { group, plugins, addPlugin } = props;
	const keys = Object.keys( plugins );

	return ( keys.map( ( item, index ) => {
			const plugin = plugins[ item ];
			const exists = -1 < group.plugins.indexOf( item );
			return (
				<div>
					<label>
						<input type={ 'checkbox' } value={ item } checked={ exists } onChange={ () => addPlugin(
							group.id, item ) }/>
						{ plugin.Name } : { plugin.Version }
					</label>
				</div>
			);
		} )
	);
}
