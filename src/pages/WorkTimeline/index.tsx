import { Suspense, lazy } from "react"

const WorkTimelineLazy = lazy(() => import("./WorkTimeline"))

export default function WorkTimeline() {
  return (
    <Suspense fallback={<h1>Загрузка...</h1>}>
      <WorkTimelineLazy />
    </Suspense>
  )
}
