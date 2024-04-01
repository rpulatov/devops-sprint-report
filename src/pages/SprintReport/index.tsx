import React, { useCallback, useState } from "react"

import { TeamProjectReference } from "azure-devops-extension-api/Core"
import { TeamSettingsIteration } from "azure-devops-extension-api/Work"
import { Card } from "azure-devops-ui/Card"
import { Page } from "azure-devops-ui/Page"

import Header from "../../components/Header"
import { NotificationLayer } from "../../components/NotificationLayer"
import { TypeReport } from "../../types/report"
import "./SprintReport.css"
import { Container } from "./components/Container"
import { SelectIteration } from "./components/SelectIteration"
import { SelectProject } from "./components/SelectProject"
import { useExportToExcel } from "./hooks/useExportToExcel"

function SprintReport() {
  const [currentProject, setCurrentProject] =
    useState<TeamProjectReference | null>(null)

  const [currentIteration, setCurrentIteration] =
    useState<TeamSettingsIteration | null>(null)

  const [typeReport, setTypeReport] = useState<TypeReport>(
    TypeReport.SprintPlan
  )

  const onChangeReport = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setTypeReport(e.target.value as TypeReport),
    []
  )

  const exportToExcel = useExportToExcel()

  const colSpanTitleForTeamReport = 12

  return (
    <Page className="report_container">
      <Header title="Отчет план/факт по спринту" />
      <div className="page-content page-content-top">
        <Card>
          <SelectProject
            onSelect={data => {
              setCurrentIteration(null)
              setCurrentProject(data)
            }}
          />
          {currentProject ? (
            <>
              <SelectIteration
                projectId={currentProject.id}
                onSelect={setCurrentIteration}
              />
              <select onChange={onChangeReport}>
                <option value={TypeReport.SprintPlan}>План спринта</option>
                <option value={TypeReport.SprintResult}>
                  Результат спринта
                </option>
              </select>
            </>
          ) : null}
        </Card>

        <table id="sprint-title" className="report_sprint">
          <thead>
            <tr>
              <td>Наименование проекта:</td>
              <td colSpan={colSpanTitleForTeamReport}>
                {currentProject?.name}
              </td>
            </tr>
            <tr>
              <td>
                {typeReport === TypeReport.SprintPlan
                  ? "План спринта:"
                  : "Результат спринта:"}
              </td>
              <td colSpan={colSpanTitleForTeamReport}>
                {currentIteration?.name}
              </td>
            </tr>
            <tr>
              <td>Период:</td>
              <td colSpan={colSpanTitleForTeamReport}>
                {currentIteration?.attributes?.startDate
                  ? new Date(
                      currentIteration?.attributes?.startDate
                    ).toLocaleDateString("ru-RU")
                  : ""}{" "}
                {" - "}
                {currentIteration?.attributes?.finishDate
                  ? new Date(
                      currentIteration?.attributes?.finishDate
                    ).toLocaleDateString("ru-RU")
                  : ""}
              </td>
            </tr>
          </thead>
        </table>

        {currentProject && currentIteration ? (
          <>
            <p>
              <button onClick={exportToExcel}>Export to Excel</button>
            </p>
            <Container
              projectId={currentProject.id}
              iteration={currentIteration}
              typeReport={typeReport}
            />
          </>
        ) : null}
      </div>
      <NotificationLayer />
    </Page>
  )
}

export default SprintReport
