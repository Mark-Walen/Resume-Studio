import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { AuthGate } from './components/auth/AuthGate.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  </StrictMode>,
);
