import { __ } from '@wordpress/i18n';
import Panel from './_panel';
import ListItem from './list-item';
import NavBar from './navigation/navbar';
import React from 'react';

export default function Multisite( props ) {

	const { params, setSiteAccess } = props;
	const siteList = props.sites.map( site => {return parseInt( site.blog_id ); } );

	return (
		<div className={ 'ui-body' }>
			<div className={ 'ui-body-sidebar' }>
				<Panel title={ 'Sites with full access' }>
					<ListItem
						name={ __( 'Select All' ) }
						bold={ true }
						callback={ ( event ) => setSiteAccess( siteList, event.target.checked ) }
						className={ 'list-control' }
						checked={ props.sites.length === props.sitesEnabled.length  }
					/>
					{ props.sites.map( site => {
						const id = parseInt( site.blog_id );
						return (
							<ListItem
								name={ site.domain }
								checked={ props.mainSite === id || -1 < props.sitesEnabled.indexOf( id ) }
								disabled={ props.mainSite === id }
								callback={ ( event ) => setSiteAccess( [ id ], event.target.checked ) }
							>
								{ props.mainSite === id &&
								<span>{ __( 'Main Site', props.slug ) }</span>
								}
							</ListItem>
						);
					} ) }
				</Panel>
			</div>
		</div>
	);
}
