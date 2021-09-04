import React from 'react';
import ReactDOM from 'react-dom';
import { __, _n } from '@wordpress/i18n';
import PluginGroupHeader from './header';
import PluginGroupList from './group-list';
import PluginsList from './plugins-list';
import Presets from './presets';
import Settings from './settings';
import Multisite from './multisite';

function PluginGroupApp( data ) {

	const unsavedKey = '_plgUnsaved';
	const [ config, setConfigState ] = React.useState( data );
	const [ tab, setTab ] = React.useState( 1 );

	const setConfig = ( newConfig ) => {
		window.localStorage.setItem( unsavedKey, true );
		if( newConfig.groups && newConfig.groups.constructor === Array ) {
			newConfig.groups = {...newConfig.groups}
		}
		setConfigState( newConfig );
	};
	const generateID = () => {
		return 'pgxxxxx'.replace( /x/g, function( c ) {
			var r = Math.random() * 16 | 0,
				v = c === 'x' ? r : ( r & 0x3 | 0x8 );
			return v.toString( 16 );
		} );
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
			if ( null === id ) {
				return;
			}
			const selected = typeof type !== 'undefined' ? ! type : newConf.groups[ id ].selected;
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
		}
		else if ( reset ) {
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
		if ( ask && ! confirm(
			_n(
				'Delete the selected group?', 'Delete the selected groups',
				ids.length, config.slug
			)
		) ) {
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
		removePlugins( id, [ plugin ] );
	};

	const removePlugins = ( id, plugins ) => {
		const newConf = getConf();
		plugins.map( plugin => {
			const index = config.groups[ id ].plugins.indexOf( plugin );
			if ( -1 < index ) {
				newConf.groups[ id ].plugins.splice( index, 1 );
			}
		} );

		setConfig( newConf );
	};
	const handleSave = () => {
		const newConf = getConf();
		const { groups, selectedPresets, params, sitesEnabled, siteID } = newConf;
		const data = JSON.stringify( {
			groups,
			selectedPresets,
			params,
			sitesEnabled,
			siteID,
		} );
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
			window.localStorage.removeItem( unsavedKey );
		} );
		setConfig( newConf );
	};

	const handleExport = () => {

		const stamp = JSON.stringify( new Date() )
		                  .replace( /"/g, '-' )
		                  .replace( /:/g, '-' )
		                  .split( '.' )[ 0 ];
		const blob = new Blob(
			[ JSON.stringify( config.groups ) ], { type: 'application/json' } );
		const url = URL.createObjectURL( blob );
		// Create a link element
		const link = document.createElement( 'a' );

		// Set link's href to point to the Blob URL
		link.href = url;
		link.download = 'plugin-groups-export' + stamp + '.json';
		link.dispatchEvent(
			new MouseEvent( 'click', {
				bubbles: true,
				cancelable: true,
				view: window
			} )
		);
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
				if ( ! newConf.groups[ id ].open ) {
					delete newConf.groups[ id ].selected;
				}
				delete newConf.groups[ id ].focus;
				delete newConf.groups[ id ].temp;
				delete newConf.groups[ id ].prevName;
			}
			else {

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

			if ( newFocus ) {
				newFocus.focus();
			}
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
		}
		else if ( 'ArrowLeft' === event.key ) {
			openGroups( getSelected(), false );
		}
		else if ( 'ArrowUp' === event.key ) {
			event.preventDefault();
			if ( ! event.shiftKey ) {
				selectGroups( getList(), false );
			}
			selectPrev();
		}
		else if ( 'ArrowDown' === event.key ) {
			event.preventDefault();
			if ( ! event.shiftKey ) {
				selectGroups( getList(), false );
			}
			selectNext();
		}
		else if ( 'Enter' === event.key && event.target.dataset.edit ) {
			editGroup( event.target.dataset.edit );
		}
		else if ( 'Enter' === event.key ) {
			event.stopPropagation();
			event.preventDefault();
			editGroups( getSelected() );
		}
		else if ( '/' === event.key ) {
			event.preventDefault();
			event.stopPropagation();
			newTempGroup( event );
		}
		else if ( 'Escape' === event.key ) {
			const id = event.path[ 0 ].dataset.edit;
			if ( config.groups[ id ] ) {
				if ( isTemp( id ) ) {
					deleteGroup( id );
				}
				else {
					changeName( id, '', true );
					maybeFocus();
				}
			}
		}
		else if ( 'Delete' === event.key ) {
			const selected = getSelected();
			if ( selected.length ) {
				deleteGroups( selected, true );
			}
		}
		else if ( 's' === event.key && event.metaKey ) {
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

	const togglePreset = ( id ) => {
		const newConf = getConf();
		if ( ! newConf.selectedPresets ) {
			newConf.selectedPresets = [];
		}
		const index = newConf.selectedPresets.indexOf( id );
		if ( -1 === index ) {
			newConf.selectedPresets.push( id );
		}
		else {
			newConf.selectedPresets.splice( index, 1 );
		}
		setConfig( newConf );
	};

	const convertLegacyData = ( oldData ) => {
		const newData = {};
		Object.keys( oldData.group ).map( ( id ) => {
			const group = oldData.group[ id ];
			newData[ id ] = {
				id: id,
				name: group.config.group_name,
				plugins: group.config.plugins ? group.config.plugins : [],
				keywords: group.config.keywords.length ? group.config.keywords.split(
					' ' ) : [],
			};
		} );

		return newData;
	};
	const handleImport = ( event ) => {

		const reader = new FileReader();
		reader.addEventListener( 'loadend', ( event ) => {
			let data = JSON.parse( event.target.result );
			if ( data ) {
				if ( data[ 'plugin-groups-setup' ] ) {
					data = convertLegacyData( data );
				}
				const newConf = getConf();
				newConf.groups = data;
				setConfig( newConf );
			}

		} );
		reader.readAsText( event.target.files[ 0 ] );
	};

	const checkSaved = () => {

	};

	React.useEffect( () => {
		window.addEventListener( 'keydown', keyNavHandler );
		return () => {
			window.removeEventListener( 'keydown', keyNavHandler );
		};
	} );

	const navTab = ( tab ) => {
		setTab( tab );
	};

	const setParam = ( param, value ) => {
		const newConf = getConf();
		if ( ! newConf.params[ param ] ) {
			newConf.params[ param ] = null;
		}
		newConf.params[ param ] = value;
		setConfig( newConf );
	};

	const setSiteAccess = ( ids, access )=>{
		const newConf = getConf();

		ids.map( id =>{
			const index = config.sitesEnabled.indexOf( id );
			if( id === config.mainSite ){
				return
			}
			if( true === access && -1 === index ){
				newConf.sitesEnabled.push( id );
			}else if ( false === access && -1 < index ){
				newConf.sitesEnabled.splice( index, 1 );
			}
		});
		setConfigState( newConf );
	}


	const setOrder = ( ids ) =>{
		const newConf = getConf();
		newConf.groups = {};
		ids.forEach( id =>{
			newConf.groups[ id ] = config.groups[id];
		});

		setConfigState( newConf );
	}


	const actions = {
		setConfig,
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
		handleExport,
		handleImport,
		togglePreset,
		removePlugins,
		navTab,
		tab,
		setParam,
		setSiteAccess,
		setOrder,
	};
	return (
		<div className={ config.slug }>
			{ 1 === tab &&
			<>
				<PluginGroupHeader { ...actions } { ...config } />
				<div className={ 'ui-body' }>
					<PluginsList { ...config } { ...actions } />
					<PluginGroupList
						{ ...config }
						{ ...actions }
					/>
					<Presets { ...config } { ...actions } />
				</div>
			</>
			}
			{ 2 === tab &&
			<>
				<PluginGroupHeader { ...actions } { ...config } />
				<Settings { ...actions } { ...config } />
			</>
			}
			{ 3 === tab &&
			<>
				<PluginGroupHeader { ...actions } { ...config } />
				<Multisite { ...actions } { ...config } />
			</>
			}
			{ 0 === tab &&
			<>
				<PluginGroupHeader { ...actions } { ...config } />
			</>
			}
		</div>
	);
}

const UI =
	{
		init( data ) {
			ReactDOM.render(
				<PluginGroupApp { ...data } />,
				document.getElementById( 'plg-app' )
			);
		}
	}
;

export default UI;
