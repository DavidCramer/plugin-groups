
const pluginGroups = {
	newInput: null,
	_init() {
		const bulkTop = document.getElementById( 'bulk-action-selector-top' );
		const bulkBottom = document.getElementById( 'bulk-action-selector-bottom' );
		this.newInput = this.createElement( 'input', {
			type: 'text',
			name: 'new_group',
		} );

		if ( bulkTop ) {
			bulkTop.addEventListener( 'change', () => {
				this.addInput( bulkTop );
			} );
			bulkBottom.addEventListener( 'change', () => {
				this.addInput( bulkBottom );
			} );
		}
	},
	createElement( type, atts ) {
		const element = document.createElement( type );
		for ( let att in atts ) {
			element[ att ] = atts[ att ];
		}
		return element;
	},
	addInput( trigger ) {
		const action = trigger.value;
		console.log( action );
		if ( action === '_add_to_new_group' ) {
			trigger.parentNode.insertBefore( this.newInput, trigger.nextSibling );
			this.newInput.focus();
		} else {
			this.newInput.parentNode.removeChild( this.newInput );
		}
	},
};

export default pluginGroups;

window.addEventListener( 'load', () => {
	pluginGroups._init();
} );
