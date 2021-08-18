import React from 'react';
import ReactDOM from 'react-dom';
import { __ } from '@wordpress/i18n';
import PluginGroupHeader from './header';
import PluginGroupList from './group-list';
import PluginsList from './plugins-list';

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
	const updateConfig = ( update ) => {
		setConfig( { ...config, ...update } );
	};
	const selectGroup = ( id ) => {
		selectGroups( [ id ] );
	};
	const selectGroups = ( ids, type ) => {
		const newConf = getConf();
		ids.forEach( ( id ) => {
			const selected = type ? ! type : newConf.groups[ id ].selected;
			newConf.groups[ id ].selected = ! selected;
			if ( selected ) {
				delete newConf.groups[ id ].open;
				delete newConf.groups[ id ].edit;
				delete newConf.groups[ id ].focus;
			}
			newConf.activeGroup = id;
		} );
		setConfig( newConf );
	};
	const openGroups = ( ids, type ) => {
		const newConf = getConf();

		ids.forEach( ( id ) => {
			newConf.groups[ id ].open = type;
		} );
		updateConfig( newConf );
	};
	const openGroup = ( id ) => {
		if ( config.groups[ id ] ) {
			const newConf = getConf();
			newConf.groups[ id ].open = ! newConf.groups[ id ].open;
			newConf.groups[ id ].selected = true;
			newConf.activeGroup = id;
			updateConfig( newConf );
		}
	};
	const changeName = ( id, name, reset ) => {
		const newConf = getConf();
		if ( ! reset && ! newConf.groups[ id ].prevName ) {
			newConf.groups[ id ].prevName = newConf.groups[ id ].name;
		} else if ( reset ) {
			name = newConf.groups[ id ].prevName ? newConf.groups[ id ].prevName : newConf.groups[ id ].name;
			delete newConf.groups[ id ].prevName;
			delete newConf.groups[ id ].edit;
			delete newConf.groups[ id ].selected;
			delete newConf.groups[ id ].open;
		}
		newConf.groups[ id ].name = name;
		setConfig( newConf );
	};

	const deleteGroups = ( ids, ask ) => {
		const newConf = getConf();
		if (  ask && ! confirm( __( ' Are you sure you want to delete all' +
			' selected' +
			' groups?' ) ) ) {
			return;
		}
		ids.forEach( ( id ) => {
			delete newConf.groups[ id ];
		} );
		setConfig( newConf );
	};
	const deleteGroup = ( id ) => {
		deleteGroups( [ id ] );
	};
	const createGroup = ( name ) => {
		const newID = generateID();
		const newGroup = {
			id: newID,
			name,
			plugins: [],
			keywords: [],
			temp: true,
			selected: true,
			edit: true,
			focus: true,
		};
		const newConf = getConf();
		if ( ! newConf.groups ) {
			newConf.groups = {};
		}
		newConf.groups[ newID ] = newGroup;

		setConfig( newConf );
	};

	const addPlugins = ( id, plugins ) => {
		if ( config.groups[ id ] ) {
			const newConf = getConf();
			plugins.forEach( ( plugin ) => {
				const index = config.groups[ id ].plugins.indexOf( plugin );
				if ( -1 === index ) {
					newConf.groups[ id ].plugins.push( plugin );
				}
			} );

			setConfig( newConf );
		}
	};

	const removePlugin = ( id, plugin ) => {
		const newConf = getConf();
		const index = config.groups[ id ].plugins.indexOf( plugin );
		if ( -1 < index ) {
			newConf.groups[ id ].plugins.splice( index, 1 );
		}
		setConfig( newConf );
	};
	const handleSave = () => {
		const newConf = getConf();
		const data = JSON.stringify( newConf.groups );
		newConf.saving = true;
		fetch( config.saveURL, {
			method: 'POST', // *GET, POST, PUT, DELETE, etc.
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': config.restNonce,
			},
			body: data
		} ).then( response => response.json() ).then( ( data ) => {
			newConf.saving = false;
			setConfig( config );
		} );
		setConfig( newConf );
	};

	const hasName = ( id ) => {
		return 0 < config.groups[ id ].name.replace(
			/ /g, '' ).length;
	};

	const isTemp = ( id ) => {
		return !! config.groups[ id ].temp;
	};
	const editGroups = ( ids ) => {
		const newConf = getConf();
		let focused = false;

		ids.forEach( ( id ) => {
			if ( newConf.groups[ id ].edit && hasName( id ) ) {
				delete newConf.groups[ id ].edit;
				delete newConf.groups[ id ].selected;
				delete newConf.groups[ id ].open;
				delete newConf.groups[ id ].focus;
				delete newConf.groups[ id ].temp;
				delete newConf.groups[ id ].prevName;
			} else {

				newConf.groups[ id ].edit = true;
				if ( ! focused ) {
					newConf.groups[ id ].focus = true;
					focused = true;
				}
			}
		} );
		setConfig( newConf );
		maybeFocus();
	};
	const editGroup = ( id ) => {
		editGroups( [ id ] );
	};

	const maybeFocus = () => {
		const editing = getEditing();
		if ( editing.length ) {
			const newFocus = document.querySelector(
				'[data-edit=' + editing.shift() + ']' );
			newFocus.focus();
		}
	};
	const newTempGroup = () => {
		createGroup( '', true );
	};
	const getShiftedID = ( id, direction ) => {
		const keys = getList();
		const position = keys.indexOf( id );
		const next = 'n' === direction ? position + 1 : position - 1;
		let groupID = null;
		if ( keys[ next ] ) {
			groupID = keys[ next ];
		}
		return groupID !== id ? groupID : null;
	};
	const selectNext = () => {
		selectGroup( getShiftedID( config.activeGroup, 'n' ) );
	};
	const selectPrev = () => {
		selectGroup( getShiftedID( config.activeGroup, 'p' ) );
	};

	const getGroupsBy = ( type ) => {
		const groups = [];
		Object.keys( config.groups ).forEach( ( id ) => {
			if ( config.groups[ id ][ type ] ) {
				groups.push( id );
			}
		} );
		return groups;
	};

	const getSelected = () => {
		return getGroupsBy( 'selected' );
	};
	const getOpen = () => {
		return getGroupsBy( 'open' );
	};
	const getEditing = () => {
		return getGroupsBy( 'edit' );
	};

	const keyNavHandler = ( event ) => {

		if ( 'ArrowRight' === event.key ) {
			openGroups( getSelected(), true );
		} else if ( 'ArrowLeft' === event.key ) {
			openGroups( getSelected(), false );
		} else if ( 'ArrowUp' === event.key ) {
			selectPrev();
		} else if ( 'ArrowDown' === event.key ) {
			selectNext();
		} else if ( 'Enter' === event.key && event.target.dataset.edit ) {
			editGroup( event.target.dataset.edit );
		} else if ( 'Enter' === event.key ) {
			event.stopPropagation();
			event.preventDefault();
			editGroups( getSelected() );
		} else if ( '/' === event.key ) {
			event.preventDefault();
			event.stopPropagation();
			newTempGroup( event );
		} else if ( 'Escape' === event.key ) {
			const id = event.path[ 0 ].dataset.edit;
			if ( config.groups[ id ] ) {
				if ( isTemp( id ) ) {
					deleteGroup( id );
				} else {
					changeName( id, '', true );
					maybeFocus();
				}
			}
		} else if ( 'Delete' === event.key ) {
			const selected = getSelected();
			if ( selected.length ) {
				deleteGroups( selected, true );
			}
		} else if ( 's' === event.key && event.metaKey ) {
			event.preventDefault();
			handleSave();
		}
	};

	const getList = () => {
		return config.groups ? Object.keys( config.groups ) : [];
	};

	const addKeyword = ( id, keyword ) => {
		const newConf = getConf();
		newConf.groups[ id ].keywords.push( keyword );
		setConfig( newConf );
	};

	const removeKeyword = ( id, keyword ) => {
		const newConf = getConf();
		const index = newConf.groups[ id ].keywords.indexOf( keyword );
		newConf.groups[ id ].keywords.splice( index, 1 );
		setConfig( newConf );
	};

	React.useEffect( () => {
		window.addEventListener( 'keydown', keyNavHandler );
		return () => {
			window.removeEventListener( 'keydown', keyNavHandler );
		};
	} );

	const actions = {
		selectGroup,
		createGroup,
		deleteGroup,
		deleteGroups,
		changeName,
		handleSave,
		editGroup,
		getList,
		addPlugins,
		addKeyword,
		removeKeyword,
		removePlugin,
		openGroup,
		selectGroups,
		getSelected,
	};
	return (
		<div className={ config.slug }>
			<PluginGroupHeader handleSave={ handleSave } { ...config } />
			<div className={ 'ui-body' }>
				<PluginsList { ...config } { ...actions } />
				<PluginGroupList
					{ ...config }
					{ ...actions }
				/>
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
