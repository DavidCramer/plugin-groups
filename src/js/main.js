import UI from './components/_ui';
import '../css/main.scss';


const PluginGroups = {
	init() {
		UI.init( plgData );
	}
};

window.addEventListener( 'load', ()=> PluginGroups.init() );
