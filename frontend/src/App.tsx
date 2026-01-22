import { tokenManager } from './api/authApi';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import NetworkSwitcher from './components/NetworkSwitcher';
import AIAssistant from './components/AIAssistant';

// Initialize token on app start
tokenManager.initializeToken();

function App() {
  return (
    <>
      <NetworkSwitcher />
      <AppRoutes />
      <AIAssistant />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
    </>
  );
}

export default App;
