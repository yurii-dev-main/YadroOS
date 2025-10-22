import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { AuthProvider } from './store/AuthProvider';
import { PWAProvider } from './mobile/context/PWAContext';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <PWAProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </PWAProvider>
    </BrowserRouter>
  </StrictMode>
);
