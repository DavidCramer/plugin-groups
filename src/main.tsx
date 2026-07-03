import { createRoot } from 'react-dom/client';
import '@/styles/styles.css';

declare global {
  interface Window {
    pluginGroupsConfig: Record<string, unknown>;
  }
}

const root = document.getElementById('plg-app');
const config = root?.dataset?.config ? JSON.parse(root.dataset.config) : {};
window.pluginGroupsConfig = config;

createRoot(root!).render(
  <div>Hello World</div>,
);
