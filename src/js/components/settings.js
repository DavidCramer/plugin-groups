import { __ } from '@wordpress/i18n';
import Panel from './_panel';
import ListItem from './list-item';
import NavBar from './navigation/navbar';

export default function Settings( props ) {

	const { params, setParam } = props;

	return (
		<div className={ 'ui-body' }>
			<div className={ 'ui-body-sidebar' }>

				<Panel title={ 'Settings' }>
					<ListItem
						name={ __( 'Use Legacy status based grouping', 'plugin-groups' ) }
						checked={ params.legacyGrouping }
						callback={ ( event ) => setParam( 'legacyGrouping', event.target.checked ) }
					/>
					<ListItem
						name={ __( 'Enable admin menu', 'plugin-groups' ) }
						checked={ params.menuGroups }
						callback={ ( event ) => setParam( 'menuGroups', event.target.checked ) }
					/>
					<ListItem
						name={ __( 'Show ungrouped items', 'plugin-groups' ) }
						checked={ params.showUngrouped }
						callback={ ( event ) => setParam( 'showUngrouped', event.target.checked ) }
					/>
				</Panel>
			</div>
			{ ! params.legacyGrouping &&
			<div className={ 'ui-body-sidebar full' }>
				<Panel title={ __( 'Navigation style', 'plugin-groups' ) }>
					<NavBar styleName={ __( 'Legacy', 'plugin-groups' ) } className={ 'subsubsub' } { ...props }/>
					<NavBar styleName={ __( 'Modern', 'plugin-groups' ) } className={ 'groups-modern' } { ...props }/>
					<NavBar styleName={ __( 'Dropdown', 'plugin-groups' ) } className={ 'groups-dropdown' } { ...props }/>
				</Panel>
			</div>
			}
		</div>
	);
}
