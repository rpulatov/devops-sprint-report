import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { SurfaceBackground, SurfaceContext } from 'azure-devops-ui/Surface';

import 'azure-devops-ui/Core/override.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SurfaceContext.Provider value={{ background: SurfaceBackground.neutral }}>
      <App />
    </SurfaceContext.Provider>
  </React.StrictMode>
);
