import { createRoot } from 'react-dom/client';
import '@/styles/styles.css';
import { Root } from '@/app/Root';
import type { Config } from '@/types/config';
import { AppProvider } from '@/state/context';
import { App } from '@/app/App';

declare global {
  interface Window {
    plgData: Config;
  }
}
// Entry point mounted by WordPress into #plg-app. Two boot paths exist depending on
// how the host page provides config: `window.plgData` (legacy/inline bootstrap) skips
// straight to <App>, otherwise <Root> fetches the config from the REST API itself.
const config: Config = window.plgData ?? null;
const container = document.getElementById('plg-app');

if (!config) {
  createRoot(container!).render(<Root container={container!} />);
} else {
  createRoot(container!).render(
    <AppProvider initialConfig={config}>
      <App />
    </AppProvider>,
  );
}
