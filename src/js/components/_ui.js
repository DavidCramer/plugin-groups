import React from 'react';
import ReactDOM from 'react-dom';
import PluginGroupHeader from './_header';
import PluginGroupList from './_group-list';
import PluginGroupEdit from './_group-edit';

function PluginGroupApp( data ) {

	const [ config, setConfig ] = React.useState( data );

	const generateID = () => {
		const s = [];
		for ( let i = 0; i < 6; i++ ) {
			s[ i ] = Math.floor(
				Math.random() * 0x10 );
		}
		return 'nd' + s.join( '' );
	};
	const getConf = () => {
		return { ...config };
	};
	const selectGroup = ( id ) => {
		const newConf = getConf();
		if ( newConf.activeGroup && ! newConf.groups[ newConf.activeGroup ].config.group_name.length ) {
			return;
		}
		newConf.activeGroup = newConf.activeGroup !== id ? id : null;
		setConfig( newConf );
	};
	const changeName = ( id, name ) => {
		const newConf = getConf();
		newConf.groups[ id ].config.group_name = name;
		setConfig( newConf );
	};
	const deleteGroup = ( id ) => {
		const newConf = getConf();
		delete newConf.groups[ id ];
		setConfig( newConf );
	};
	const createGroup = ( name ) => {
		const newID = generateID();
		const newGroup = {
			config: {
				group_name: name,
				keywords: '',
				plugins: {}
			},
			_id: newID,
		};
		const newConf = getConf();
		newConf.groups[ newID ] = newGroup;
		newConf.activeGroup = newID;
		selectGroup( newID );
	};

	const addPlugin = ( id, plugin ) => {
		const newConf = getConf();
		if ( ! newConf.groups[ id ].config.plugins.length ) {
			newConf.groups[ id ].config.plugins = [];
		}
		const exists = newConf.groups[ id ].config.plugins.indexOf( plugin );
		if ( -1 < exists ) {
			newConf.groups[ id ].config.plugins.splice( exists, 1 );
		} else {
			newConf.groups[ id ].config.plugins.push( plugin );
		}
		setConfig( newConf );
	};
	return (
		<div className={ config.slug }>
			<PluginGroupHeader { ...config } />
			<div className={ 'ui-body' }>
				<PluginGroupList
					groups={ config.groups }
					activeGroup={ config.activeGroup ? config.activeGroup : null }
					selectGroup={ selectGroup }
					createGroup={ createGroup }
					deleteGroup={ deleteGroup }
					changeName={ changeName }
				/>
				{ config.activeGroup && config.groups[ config.activeGroup ] &&
				<PluginGroupEdit group={ config.groups[ config.activeGroup ] } addPlugin={ addPlugin } { ...config } />
				}
			</div>
		</div>
	);
}


const UI = {
	init( data ) {
		ReactDOM.render(
			<PluginGroupApp { ...data } />,
			document.getElementById( 'plg-app' )
		);
	}
};

export default UI;
