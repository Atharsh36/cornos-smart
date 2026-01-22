import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { cronosTestnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import App from './App';
import './styles/index.css';

const queryClient = new QueryClient();

const config = createConfig({
  chains: [cronosTestnet],
  connectors: [
    injected(), // Metamask, etc.
  ],
  transports: {
    [cronosTestnet.id]: http(),
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
