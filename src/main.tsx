import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { scrubUrl, tokenStore } from '@/auth';
import { loadConfig } from '@/config';
import { ErrorBoundary } from '@/ui/ErrorBoundary';
import './ui/theme';
import { App } from './App';
import './ui/styles.css';

// Provisional token intake (SDD OQ-21): whatever token-like parameter arrives in the URL is
// taken into memory and removed from the address bar before the router starts (TC-08).
const scrubbed = scrubUrl(window);
if (scrubbed.token) tokenStore.set(scrubbed.token);

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <App configResult={loadConfig()} />
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>,
);
