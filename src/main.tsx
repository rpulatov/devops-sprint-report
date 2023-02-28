import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { SurfaceBackground, SurfaceContext } from 'azure-devops-ui/Surface';

import 'azure-devops-ui/Core/override.css';

ReactDOM.render(
  <SurfaceContext.Provider value={{ background: SurfaceBackground.neutral }}>
    <App />
  </SurfaceContext.Provider>,
  document.getElementById('root') as HTMLElement
);
