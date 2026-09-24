import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import {AuthProvider} from './contexts/AuthContext.tsx';
import {AuthGate} from './components/auth/AuthGate.tsx';
import {AppFeedbackProvider} from './components/common/AppFeedback.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppFeedbackProvider>
        <AuthGate />
      </AppFeedbackProvider>
    </AuthProvider>
  </StrictMode>,
);
