import { __ } from '@wordpress/i18n';

const BulkHandler = {
	newGroupInput: null,
	groupSelector: null,
	init() {
		const selectors = document.querySelectorAll( 'select[name^="action"]' );
		selectors.forEach( ( selector ) => {
			selector.addEventListener( 'change', ( ev ) => {
				this.handleChange( selector );
			} );
		} );
	},
	handleChange( selector ) {
		if ( this.newGroupInput ) {
			this.newGroupInput.parentNode.removeChild( this.newGroupInput );
			this.newGroupInput = null;
		}
		if ( this.groupSelector ) {
			this.groupSelector.parentNode.removeChild( this.groupSelector );
			this.groupSelector = null;
		}
		switch ( selector.value ) {
			case 'add-to-group':
				this.addToGroup( selector );
				break;

		}
	},
	addToGroup( selector ) {
		if ( ! this.groupSelector ) {
			this.groupSelector = this.makeSelector();
		}
		this.groupSelector.addEventListener( 'change', () => {
			if ( this.groupSelector.value === '__new' ) {
				this.newGroup( this.groupSelector );
			}
			else if ( this.newGroupInput ) {
				selector.parentNode.removeChild( this.newGroupInput );
				this.newGroupInput = null;
			}
		} );
		selector.parentNode.insertBefore( this.groupSelector, selector.nextSibling );
	},
	makeSelector() {
		const select = document.createElement( 'select' );
		select.name = 'group_id';
		plgData.forEach( group => {
			const option = document.createElement( 'option' );
			option.value = group.id;
			option.innerText = group.name;
			select.appendChild( option );
		} );
		// Add new group option.
		const optionGroup = document.createElement( 'optgroup' );
		const option = document.createElement( 'option' );
		optionGroup.label = '---------';
		option.value = '__new';
		option.innerText = __( 'New group', 'plugin-groups' );
		optionGroup.appendChild( option );
		select.appendChild( optionGroup );
		return select;
	},
	newGroup( selector ) {
		if ( ! this.newGroupInput ) {
			this.newGroupInput = document.createElement( 'input' );
			this.newGroupInput.type = 'text';
			this.newGroupInput.className = 'regular-text';
			this.newGroupInput.placeholder = __( 'New group name', 'plugin-groups' );
			this.newGroupInput.name = 'new_group_name';
		}
		selector.parentNode.insertBefore( this.newGroupInput, selector.nextSibling );
		this.newGroupInput.focus();
	}
};

window.addEventListener( 'load', () => BulkHandler.init() );
export default BulkHandler;
