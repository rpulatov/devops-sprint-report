import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";

import Home from "./pages/Home";
import SprintReport from "./pages/SprintReport";
import WorkTimeline from "./pages/WorkTimeline";
import NoMatch from "./pages/NoMatch";
import UserReport from "./pages/UserReport";

import { SurfaceBackground, SurfaceContext } from "azure-devops-ui/Surface";

import "azure-devops-ui/Core/override.css";
import "./main.css";

const { VITE_BASE_URL } = import.meta.env;

ReactDOM.render(
  <SurfaceContext.Provider value={{ background: SurfaceBackground.neutral }}>
    <BrowserRouter basename={VITE_BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/report" element={<SprintReport />} />
        <Route path="/user-report" element={<UserReport />} />
        
        <Route path="/timeline" element={<WorkTimeline />} />

        <Route path="*" element={<NoMatch />} />
      </Routes>
    </BrowserRouter>
  </SurfaceContext.Provider>,
  document.getElementById("root") as HTMLElement
);
