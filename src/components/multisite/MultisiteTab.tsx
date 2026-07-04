import { __ } from '@wordpress/i18n';
import { useAppDispatch, useAppState } from '@/state/context';

export function MultisiteTab () {
  const { config } = useAppState();
  const dispatch = useAppDispatch();
  const sites = config.sites ?? [];
  const sitesEnabled = config.sitesEnabled ?? [];
  const siteIds = sites.map((site) => parseInt(String(site.blog_id), 10));
  const allSelected = sites.length > 0 && siteIds.every((id) => sitesEnabled.includes(id));

  return (
    <div className="flex bg-white h-full">
      <div className="w-72  shrink-0 border-r border-gray-200">
        <div className="px-4 pt-4 pb-3">
          <div className="section-title">{__('Sites with full access', 'plugin-groups')}</div>
        </div>
        <label className="wp-row flex items-center gap-2 px-4 py-2 border-t border-gray-100 cursor-pointer">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(event) => dispatch({ type: 'SET_SITE_ACCESS', ids: siteIds, enabled: event.target.checked })}
          />
          <span className="text-sm font-semibold text-gray-800">{__('Select All', 'plugin-groups')}</span>
        </label>
        {sites.map((site) => {
          const id = parseInt(String(site.blog_id), 10);
          return (
            <label key={id} className="wp-row flex items-center gap-2 px-4 py-2 border-t border-gray-100 cursor-pointer">
              <input
                type="checkbox"
                checked={sitesEnabled.includes(id)}
                onChange={(event) => dispatch({ type: 'SET_SITE_ACCESS', ids: [id], enabled: event.target.checked })}
              />
              <span className="flex-1 text-sm text-gray-700">{`${site.domain}${site.path}`}</span>
              {config.mainSite === id && <span className="tag tag-gray">{__('Main Site', 'plugin-groups')}</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
}
