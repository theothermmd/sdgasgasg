import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Store } from './store/store.js';
import App from './App.jsx';
import './index.css';
import '../src/fonts/vazir-fd.css';

const Queryclient = new QueryClient();
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={Store}>
      <QueryClientProvider client={Queryclient}>
        <App />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
