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
}

function readBootstrap(container: HTMLElement): Bootstrap | null {
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

export function Root({ container }: RootProps) {
  const [config, setConfig] = useState<Config | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const bootstrap = readBootstrap(container);
      if (!bootstrap) {
        throw new ApiError(__('Plugin Groups could not start: missing bootstrap data.', 'plugin-groups'));
      }
      return loadSiteConfig(bootstrap.loadURL, bootstrap.restNonce, bootstrap.siteID);
    };

    run()
      .then((data) => {
        if (!cancelled) {
          setConfig(data);
        }
      })
      .catch((err: unknown) => {
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
    return <div className="p-6 text-sm text-gray-500">{__('Loading…', 'plugin-groups')}</div>;
  }

  return (
    <AppProvider initialConfig={config}>
      <App />
    </AppProvider>
  );
}
