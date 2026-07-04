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
