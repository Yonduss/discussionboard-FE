import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx';
import { AuthProvider } from "./contexts/AuthProvider.jsx";
import { ModalProvider } from "./contexts/ModalProvider.jsx";
import "./styles/common.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <AuthProvider>
          <ModalProvider>
              <App />
          </ModalProvider>
      </AuthProvider>
  </StrictMode>
);
