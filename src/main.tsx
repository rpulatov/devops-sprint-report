import ReactDOM from "react-dom"
import { HashRouter, Route, Routes } from "react-router-dom"

import "azure-devops-ui/Core/override.css"
import { SurfaceBackground, SurfaceContext } from "azure-devops-ui/Surface"

import "./main.css"
import Home from "./pages/Home"
import NoMatch from "./pages/NoMatch"
import SprintReport from "./pages/SprintReport"
import UserReport from "./pages/UserReport"
import WorkTimeline from "./pages/WorkTimeline"

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
)
