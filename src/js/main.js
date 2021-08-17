import UI from './components/ui';
import '../css/main.scss';

const PluginGroups = {
	init() {
		if ( ! plgData.groups ) {
			plgData.groups = {};
		}

		plgData.activeGroup = false;
		UI.init( plgData );
	}
};

window.addEventListener( 'load', () => PluginGroups.init() );