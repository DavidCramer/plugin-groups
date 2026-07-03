import { useAppState } from '@/state/context';

interface MultisiteSiteSwitcherProps {
  onSiteSwitch: (siteId: number) => void;
}

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
