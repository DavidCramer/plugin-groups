import React from 'react';
import PluginGroupPlugins from './_plugins';

export default function PluginGroupEdit( props ) {
	const { group } = props;
	return (
		<div className={ 'ui-body-edit' }>
			<h3>{ group.config.group_name }</h3>
			<PluginGroupPlugins {...props} />
		</div>
	);
}
