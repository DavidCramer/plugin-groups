import { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { AppProvider } from '@/state/context';
import { App } from './App';
import { loadSiteConfig } from '@/api/client';
import { ApiError } from '@/types/api';
import type { Config } from '@/types/config';

interface Bootstrap {
  loadURL: string;
  restNonce: string;
  siteID: number;
  networkAdmin?: boolean;
}

function readBootstrap (container: HTMLElement): Bootstrap | null {
  const raw = container.dataset.bootstrap;
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as Bootstrap;
  } catch {
    return null;
  }
}

interface RootProps {
  container: HTMLElement;
}

/**
 * Bootstraps the admin UI when no config was inlined into the page.
 *
 * Reads `data-bootstrap` off the mount element (loadURL/restNonce/siteID JSON,
 * written server-side in `includes/main.php`), fetches the real config over REST,
 * and renders a loading/error state until it resolves. Once loaded, hands off to
 * <App> inside an <AppProvider>.
 */
export function Root ({ container }: RootProps) {
  const [config, setConfig] = useState<Config | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = readBootstrap(container);
    if (!bootstrap) {
      throw new ApiError(__('Plugin Groups could not start: missing bootstrap data.', 'plugin-groups'));
    }

    const run = async () => {
      return loadSiteConfig(bootstrap.loadURL, bootstrap.restNonce, bootstrap.siteID);
    };

    run().then((data) => {
      if (!cancelled) {
        setConfig({ ...data, networkAdmin: bootstrap.networkAdmin ?? false });
      }
    }).catch((err: unknown) => {
      if (!cancelled) {
        setError(err instanceof ApiError ? err.message : __('Could not load the Plugin Groups configuration.', 'plugin-groups'));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [container]);

  if (error) {
    return (
      <div className="p-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded m-4">
        {error}
      </div>
    );
  }

  if (!config) {
    return (
      <div className={`plugin-groups`}>
        <div className="bg-brand px-6 py-3 text-white text-sm shadow-sm flex items-center gap-4">
          <h1 className="text-white! py-6! font-semibold text-lg tracking-tight">Plugin Groups</h1>
          <span className={`inline-flex border-3 border-brand-light border-r-brand-border rounded-full animate-spin mr-2 w-6 h-6`}></span>
          {__('Loading', 'plugin-groups')}
        </div>
      </div>
    );
  }

  return (
    <AppProvider initialConfig={config}>
      <App />
    </AppProvider>
  );
}
