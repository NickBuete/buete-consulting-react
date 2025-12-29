import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { register as registerServiceWorker } from './serviceWorkerRegistration';
import { OfflineProvider } from './context/OfflineContext';
import { QueryProvider } from './providers/QueryProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <QueryProvider>
    <OfflineProvider>
      <App />
    </OfflineProvider>
  </QueryProvider>,
);

registerServiceWorker();
