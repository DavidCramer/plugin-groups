import React from 'react';
import ReactDOM from 'react-dom';
import PluginGroupHeader from './header';
import PluginGroupList from './group-list';
import PluginGroupEdit from './group-edit';

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
		if ( -1 < getList().indexOf( id ) ) {
			if ( config.edit ) {
				if ( config.edit === config.activeGroup ) {
					// Check that the name is set.
					if ( ! hasName( config.activeGroup ) ) {
						// Delete if temp, stop if not.
						if ( isTemp( config.activeGroup ) ) {
							delete newConf.groups[ config.activeGroup ];
						} else {
							changeName( config.activeGroup, true, true );
						}
					}
				}
				newConf.edit = null;
			}
			newConf.activeGroup = newConf.activeGroup === id ? null : id;
			setConfig( newConf );
		}
	};
	const changeName = ( id, name, reset ) => {
		const newConf = getConf();
		if ( ! reset && ! newConf.groups[ id ].prevName ) {
			newConf.groups[ id ].prevName = newConf.groups[ id ].name;
		} else if ( reset ) {
			name = newConf.groups[ id ].prevName ? newConf.groups[ id ].prevName : newConf.groups[ id ].name;
			delete newConf.groups[ id ].prevName;
			newConf.edit = null;
		}
		newConf.groups[ id ].name = name;
		setConfig( newConf );
	};
	const deleteGroup = ( id ) => {
		const newConf = getConf();
		if ( newConf.activeGroup && newConf.activeGroup === id ) {
			newConf.activeGroup = getShiftedID( config.activeGroup, 'p' );
		}
		delete newConf.groups[ id ];
		if ( id === newConf.activeGroup ) {
			newConf.activeGroup = null;
		}
		newConf.edit = null;
		setConfig( newConf );
	};
	const createGroup = ( name, temp ) => {
		const newID = generateID();
		const newGroup = {
			id: newID,
			name,
			plugins: [],
			keywords: [],
		};
		if ( temp ) {
			newGroup.temp = true;
		}
		const newConf = getConf();
		if ( ! newConf.groups ) {
			newConf.groups = {};
		}
		newConf.groups[ newID ] = newGroup;
		newConf.activeGroup = newID;
		newConf.edit = newID;
		setConfig( newConf );
	};

	const addPlugin = ( id, plugin ) => {
		const newConf = getConf();
		if ( ! newConf.groups[ id ].plugins.length ) {
			newConf.groups[ id ].plugins = [];
		}
		const exists = newConf.groups[ id ].plugins.indexOf( plugin );
		if ( -1 < exists ) {
			newConf.groups[ id ].plugins.splice( exists, 1 );
		} else {
			newConf.groups[ id ].plugins.push( plugin );
		}
		setConfig( newConf );
	};
	const handleSave = () => {
		const newConf = getConf();
		const data = JSON.stringify( newConf.groups );
		console.log( newConf.groups );
		console.log( data );
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

	const editGroup = ( id ) => {
		const newConf = getConf();
		if ( newConf.edit && id === newConf.edit && hasName( id ) ) {
			newConf.edit = null;
			if ( newConf.groups[ id ].temp ) {
				delete newConf.groups[ id ].temp;
			}
			delete newConf.groups[ id ].prevName;
		} else {
			newConf.edit = id;
			newConf.activeGroup = id;
		}

		setConfig( newConf );
	};

	const newTempGroup = () => {
		createGroup( '', true );
	};
	const getShiftedID = ( id, direction ) => {
		const keys = getList();
		const position = keys.indexOf( id );
		const next = 'n' === direction ? position + 1 : position - 1;
		let groupID = keys.length ? keys[ 0 ] : null;
		if ( keys[ next ] ) {
			groupID = keys[ next ];
		} else if ( 'p' === direction ) {
			groupID = keys[ keys.length - 1 ];
		}
		return groupID !== id ? groupID : null;
	};
	const selectNext = () => {
		selectGroup( getShiftedID( config.activeGroup, 'n' ) );
	};
	const selectPrev = () => {
		selectGroup( getShiftedID( config.activeGroup, 'p' ) );
	};

	const keyNavHandler = ( event ) => {

		if ( 'ArrowUp' === event.key ) {
			selectPrev();
		} else if ( 'ArrowDown' === event.key ) {
			selectNext();
		} else if ( config.activeGroup && 'Enter' === event.key && ! event.target.type ) {
			event.stopPropagation();
			editGroup( config.activeGroup );
		} else if ( 'Enter' === event.key && event.target.dataset.edit ) {
			editGroup( event.target.dataset.edit );
		} else if ( '/' === event.key ) {
			event.preventDefault();
			event.stopPropagation();
			newTempGroup( event );
		} else if ( 'Escape' === event.key && config.edit ) {
			if ( config.groups[ config.activeGroup ] && isTemp(
				config.activeGroup ) ) {
				deleteGroup( config.activeGroup );
			} else {
				changeName( config.activeGroup, '', true );
			}
		} else if ( 'Delete' === event.key ) {
			if ( config.groups[ config.activeGroup ] ) {
				if ( confirm( ' Are you sure' ) ) {
					deleteGroup( config.activeGroup );
				}
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
		changeName,
		handleSave,
		editGroup,
		getList,
		addPlugin,
		addKeyword,
		removeKeyword,
	};
	return (
		<div className={ config.slug }>
			<PluginGroupHeader handleSave={ handleSave } { ...config } />
			<div className={ 'ui-body' }>
				<PluginGroupList
					{ ...config }
					{ ...actions }
				/>
				{ config.activeGroup &&
				<PluginGroupEdit group={ config.groups[ config.activeGroup ] } { ...actions } { ...config } />
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
