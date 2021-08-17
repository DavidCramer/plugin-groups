import React from 'react';
import PluginGroupPlugins from './plugins';
import PluginGroupKeywords from './keywords';
import { __ } from '@wordpress/i18n';

export default function PluginGroupEdit( props ) {
	const { group } = props;
	return (
		<div className={ 'ui-body-edit' }>
			<h3>
				{ 0 !== group.name.length && group.name }
				{ 0 === group.name.length && group.temp &&
				__( 'New Group' )
				}
				{ 0 === group.name.length && ! group.temp &&
				__( 'Untitled Group' )
				}
			</h3>
			<PluginGroupPlugins { ...props } />
			<PluginGroupKeywords { ...props } />
		</div>
	);
}
