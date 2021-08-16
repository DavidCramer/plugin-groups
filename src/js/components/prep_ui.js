import React from 'react';
import ReactDOM from 'react-dom';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import PluginGroupList from './_group-list';
import PluginGroupEdit from './_group-edit';

function App( data ) {

	const initGroup = () => {
		if ( typeof data.group.length !== 'undefined' && ! data.group.length ) {
			data.group = {};
		}
		return data;
	};

	const [ config, setConfig ] = React.useState( initGroup() );
	const [ activeGroup, setActiveGroup ] = React.useState(
		data.active_edit_group && data.group[ data.active_edit_group ] ? data.group[ data.active_edit_group ].config : null );

	const randomUUID = () => {
		const s = [], itoh = '0123456789ABCDEF';
		for ( let i = 0; i < 6; i++ ) {
			s[ i ] = Math.floor(
				Math.random() * 0x10 );
		}
		return 'nd' + s.join( '' );
	};
	const selectGroup = ( event, index ) => {
		const newActive = { ...config.group[ index ].config };
		newActive.id = index;
		setActiveGroup( newActive );
		const newConf = { ...config };
		newConf.active_edit_group = index;
		setConfig( newConf );
	};
	const changeName = ( name ) => {
		const newGroup = { ...activeGroup };
		newGroup.group_name = name;
		setActiveGroup( newGroup );
		const newConfig = { ...config };
		newConfig.group[ activeGroup.id ].config = newGroup;
		setConfig( newConfig );
	};
	const createGroup = ( name ) => {
		const newID = randomUUID();
		const newGroup = {
			config: {
				group_name: name,
				keywords: '',
				plugins: {}
			},
			_id: newID,
		};
		const newConfig = { ...config };
		newConfig.group[ newID ] = newGroup;
		setConfig( newConfig );
		selectGroup( null, newID );
	};

	return (
		<Grid container spacing={ 3 }>
			<input type={ 'hidden' } value={ JSON.stringify(
				config ) } name={ 'plugin-group-config' }/>
			<Grid item xs={ 12 } sm={ 3 }>
				<Paper elevation={0} className={ 'ui-body-sidebar' }>
					<PluginGroupList groups={ config.group } activeGroup={ activeGroup } selectGroup={ selectGroup } createGroup={ createGroup }/>
				</Paper>
			</Grid>
			{ activeGroup &&
			<Grid item xs={ 12 } sm={ 9 }>
				<PluginGroupEdit group={ activeGroup } changeName={ changeName }/>
			</Grid>
			}
			{ JSON.stringify( config ) }
		</Grid>
	);
}


const UI = {
	init( data ) {
		ReactDOM.render(
			<App { ...data } />, document.querySelector( '#app' ) );
	}
};

export default UI;
