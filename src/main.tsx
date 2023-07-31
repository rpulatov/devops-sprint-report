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
        <Route path='/devops-sprint-report/' element={<Home />} />

        <Route path="/devops-sprint-report/report" element={<Report />} />
        <Route path="/devops-sprint-report/timeline" element={<WorkTimeline />} />

        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </SurfaceContext.Provider>,
  document.getElementById('root') as HTMLElement
);
