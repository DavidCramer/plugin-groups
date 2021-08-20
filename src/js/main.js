import UI from './components/ui';
import '../css/main.scss';
import '../css/navbar.scss';

const PluginGroups = {
	init() {

		// Clean up the save lock.
		window.localStorage.removeItem( '_plgUnsaved' );
		if ( ! plgData.groups ) {
			plgData.groups = {};
		}
		if ( ! plgData.selectedPresets ) {
			plgData.selectedPresets = [];
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
