import { useAppState } from '@/state/context';

interface MultisiteSiteSwitcherProps {
  onSiteSwitch: (siteId: number) => void;
}

/**
 * Site-select dropdown shown in the header on network admin. Renders nothing if the
 * config has no `sites` list (i.e. not in a network-admin context). Selecting a site
 * triggers `onSiteSwitch`, which is responsible for loading that site's config.
 */
export function MultisiteSiteSwitcher({ onSiteSwitch }: MultisiteSiteSwitcherProps) {
  const { config } = useAppState();
  if (!config.sites) {
    return null;
  }

  return (
    <select
      className="wp-input text-xs w-auto"
      value={config.siteID}
      onChange={(event) => onSiteSwitch(parseInt(event.target.value, 10))}
    >
      {config.sites.map((site) => {
        const id = parseInt(String(site.blog_id), 10);
        return (
          <option key={id} value={id}>
            {`${site.domain}${site.path}`}
          </option>
        );
      })}
    </select>
  );
}
