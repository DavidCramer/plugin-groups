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
						name={ __( 'Use Legacy status based grouping', props.slug ) }
						checked={ params.legacyGrouping }
						callback={ ( event ) => setParam( 'legacyGrouping', event.target.checked ) }
					/>
					<ListItem
						name={ __( 'Enable admin menu', props.slug ) }
						checked={ params.menuGroups }
						callback={ ( event ) => setParam( 'menuGroups', event.target.checked ) }
					/>
					<ListItem
						name={ __( 'Show ungrouped items', props.slug ) }
						checked={ params.showUngrouped }
						callback={ ( event ) => setParam( 'showUngrouped', event.target.checked ) }
					/>
				</Panel>
			</div>
			{ ! params.legacyGrouping &&
			<div className={ 'ui-body-sidebar full' }>
				<Panel title={ __( 'Navigation style', props.slug ) }>
					<NavBar styleName={ __( 'Legacy', props.slug ) } className={ 'subsubsub' } { ...props }/>
					<NavBar styleName={ __( 'Modern', props.slug ) } className={ 'groups-modern' } { ...props }/>
					<NavBar styleName={ __( 'Dropdown', props.slug ) } className={ 'groups-dropdown' } { ...props }/>
				</Panel>
			</div>
			}
		</div>
	);
}
