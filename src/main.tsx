import ReactDOM from "react-dom"
import { HashRouter, Route, Routes } from "react-router-dom"

import "azure-devops-ui/Core/override.css"
import { SurfaceBackground, SurfaceContext } from "azure-devops-ui/Surface"

import { RedirectPage } from "./components/RedirectPage"
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
        <Route path="/:organization/">
          <Route path="/:organization/" element={<Home />} />

          <Route path="/:organization/report" element={<SprintReport />} />
          <Route path="/:organization/user-report" element={<UserReport />} />

          <Route path="/:organization/timeline" element={<WorkTimeline />} />

          <Route path="/:organization/*" element={<NoMatch />} />
        </Route>
        <Route path="*">
          <RedirectPage>
            <NoMatch />
          </RedirectPage>
        </Route>
      </Routes>
    </HashRouter>
  </SurfaceContext.Provider>,
  document.getElementById("root") as HTMLElement
)
