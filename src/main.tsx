import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';

import App from './App';
import { AuthProvider } from './store/AuthProvider';
import { PWAProvider } from './mobile/context/PWAContext';

const Router = __DEMO_SINGLEFILE__ ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Router>
      <PWAProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </PWAProvider>
    </Router>
  </StrictMode>
);
