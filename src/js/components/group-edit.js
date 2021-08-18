import React from 'react';
import PluginGroupPlugins from './plugins';
import PluginGroupKeywords from './keywords';
import Panel from './_panel';

export default function PluginGroupEdit( props ) {
	const { group } = props;
	return (
		<div className={ 'ui-body-sidebar-list-item-edit' }>
			<PluginGroupPlugins {...props} />
			<PluginGroupKeywords { ...props } />
		</div>
	);
}
