import ReactDOM from "react-dom";
import { Routes, Route, HashRouter } from "react-router-dom";

import Home from "./pages/Home";
import SprintReport from "./pages/SprintReport";
import WorkTimeline from "./pages/WorkTimeline";
import NoMatch from "./pages/NoMatch";
import UserReport from "./pages/UserReport";

import { SurfaceBackground, SurfaceContext } from "azure-devops-ui/Surface";

import "azure-devops-ui/Core/override.css";
import "./main.css";

ReactDOM.render(
  <SurfaceContext.Provider value={{ background: SurfaceBackground.neutral }}>
    <HashRouter>
      <Routes>
        <Route path="" element={<Home />} />

        <Route path="/report" element={<SprintReport />} />
        <Route path="/user-report" element={<UserReport />} />

        <Route path="/timeline" element={<WorkTimeline />} />

        <Route path="*" element={<NoMatch />} />
      </Routes>
    </HashRouter>
  </SurfaceContext.Provider>,
  document.getElementById("root") as HTMLElement
);
