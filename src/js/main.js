import UI from './components/ui';
import '../css/main.scss';
import '../css/navbar.scss';

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
window.onbeforeunload = function( e ) {
	if ( window.localStorage.getItem( '_plgUnsaved' ) ) {
		return false;
	}
};
