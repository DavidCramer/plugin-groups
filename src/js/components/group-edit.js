import PluginGroupPlugins from './plugins';
import PluginGroupKeywords from './keywords';

export default function PluginGroupEdit( props ) {
	const { group } = props;
	return (
		<div className={ 'ui-body-sidebar-list-item-edit' }>
			<PluginGroupPlugins { ...props } />
			<PluginGroupKeywords { ...props } />
		</div>
	);
}
