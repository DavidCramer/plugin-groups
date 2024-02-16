import { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import RenderList from './render-list';
import Panel from './_panel';
import ListItem from './list-item';
import Sortable from 'sortablejs';

export default function PluginGroupList( props ) {
	const {
		getList,
		createGroup,
		deleteGroups,
		selectGroups,
		getSelected,
		setOrder,
	} = props;
	const checked = getSelected().length === Object.keys(
		props.groups ).length;

	if ( 0 !== getList().length ) {
		useEffect( () => {
			const callback = () => {
				const orders = sortable.toArray();
				setOrder( orders );
			};
			const options = {
				animation: 150,
				ghostClass: 'active-sort',
				handle: '.sort-handle',
				direction: 'vertical',
				onUpdate: function() {
					callback();
				},
			};
			const element = document.getElementById( 'plugin-groups-list' );
			const sortable = Sortable.create( element, options );
		} );
	}

	return (
		<div className={ 'ui-body-sidebar wide' }>
			<Panel title={ __( 'Groups' ) }>
				<div className={ 'ui-body-sidebar-list' }>
					{ 0 !== getList().length &&
					<>

						<ListItem
							name={ __( 'Select All' ) }
							bold={ true }
							callback={ ( event ) => {
								selectGroups(
									Object.keys( props.groups ),
									event.target.checked
								);
							} }
							checked={ checked }
							className={ 'list-control' }
						>
							<button disabled={ ! getSelected().length }
							        type={ 'button' }
							        className={ 'button' }
							        onClick={ () => {
								        deleteGroups( getSelected(), true );
							        } }
							>
								<span className={ 'text' }> { __( 'Delete selected', 'plugin-groups' ) } </span>
								<span className="dashicons dashicons-trash"/>
							</button>
						</ListItem>
						<div id={ 'plugin-groups-list' }>
							<RenderList { ...props } />
						</div>
					</>
					}
					{ 0 === getList().length &&
					<div className={ 'description' }>
						<span className="ui-body-edit-plugins-item">{ __( 'No groups created', 'plugin-groups' ) }</span>
					</div>
					}
				</div>
			</Panel>
			<button type={ 'button' }
			        className={ 'button' }
			        onClick={ () => createGroup( '', true ) }>
				{ __( 'Create new group', 'plugin-groups' ) }
			</button>
		</div>
	);
}
