import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Report from './pages/Report';
import WorkTimeline from './pages/WorkTimeline';

import { SurfaceBackground, SurfaceContext } from 'azure-devops-ui/Surface';

import 'azure-devops-ui/Core/override.css';

ReactDOM.render(
  <SurfaceContext.Provider value={{ background: SurfaceBackground.neutral }}>
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />

        <Route path="report" element={<Report />} />
        <Route path="timeline" element={<WorkTimeline />} />

        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </SurfaceContext.Provider>,
  document.getElementById('root') as HTMLElement
);
