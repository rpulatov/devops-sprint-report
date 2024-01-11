import React from "react"

import { Page } from "azure-devops-ui/Page"

import { errorNotification } from "../../api/notificationObserver"
import Header from "../../components/Header"
import { getIterations } from "../../domains"
import { useOrganization } from "../../hooks/useOrganization"
import { useProjects } from "../../hooks/useProjects"
import "./UserReport.css"
import { Loader } from "./components/Loader"
import { UserReportContainer } from "./components/UserReportContainer"
import { IterationAcrossProjects } from "./components/UserReportContainer/hooks/useUserReport"
import { UserReportContent } from "./components/UserReportContent"
import { colors } from "./utils/colors"

export const USER_REPORT_TITLE = "Отчет по сотруднику"

export default function UserReport() {
  const [loading, setLoading] = React.useState(true)

  const [iterations, setIterations] = React.useState<IterationAcrossProjects[]>(
    []
  )

  const { organization } = useOrganization()
  const { projects } = useProjects(organization)

  const projectColors = React.useMemo(
    () =>
      projects.reduce<{
        [projectId: string]: { red: number; green: number; blue: number }
      }>((acc, cur, index) => {
        const [red, green, blue] =
          colors[index < colors.length ? index : colors.length - 1]
        acc[cur.id] = { red, green, blue }
        return acc
      }, {}),
    [projects]
  )

  React.useEffect(() => {
    if (!projects.length) return undefined

    Promise.all(
      projects.map(project =>
        getIterations({ organization, projectId: project.id })
      )
    )
      .then(res => {
        const resultIterations = res.flatMap<IterationAcrossProjects>(
          (baseIterations, indexProject) =>
            baseIterations.map(baseIteration => ({
              ...baseIteration,
              attributes: {
                startDate: new Date(baseIteration.attributes.startDate),
                finishDate: new Date(baseIteration.attributes.finishDate),
                timeFrame: baseIteration.attributes.timeFrame,
              },
              project: {
                id: projects[indexProject].id,
                name: projects[indexProject].name,
              },
            }))
        )
        setIterations(resultIterations)
      })
      .catch(errorNotification)
      .finally(() => setLoading(false))
  }, [projects, organization])

  return (
    <Page className="user-report">
      <Header title={USER_REPORT_TITLE} />
      {loading ? <Loader /> : null}
      {iterations.length > 0 ? (
        <UserReportContainer
          organization={organization}
          iterations={iterations}
          projects={projects}
        >
          <UserReportContent projectColors={projectColors} />
        </UserReportContainer>
      ) : null}
    </Page>
  )
}
