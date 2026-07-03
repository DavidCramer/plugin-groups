import { createRoot } from 'react-dom/client';
import '@/styles/styles.css';
import { Root } from '@/app/Root';

const container = document.getElementById('plg-app');

createRoot(container!).render(<Root container={container!} />);
