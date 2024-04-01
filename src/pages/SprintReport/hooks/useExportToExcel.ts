import React from "react"

export function useExportToExcel() {
  return React.useCallback(async () => {
    const XLSX = await import("xlsx")

    const wb = XLSX.utils.book_new()

    const ws1 = XLSX.utils.table_to_sheet(
      document.querySelector("#sprint-title")
    )

    const ws11 = XLSX.utils.table_to_sheet(
      document.querySelector("#team-report")
    )

    const dataTeamReport = XLSX.utils.sheet_to_json<{ [key: string]: string }>(
      ws11,
      { header: 1, blankrows: false }
    )

    const aoaTeamReport = dataTeamReport.map(Object.values)

    XLSX.utils.sheet_add_aoa(ws1, aoaTeamReport, { origin: 5 })

    XLSX.utils.book_append_sheet(wb, ws1, "Отчет по команде")

    const ws2 = XLSX.utils.table_to_sheet(
      document.querySelector("#user-story-report")
    )
    XLSX.utils.book_append_sheet(wb, ws2, "User Story")

    const ws3 = XLSX.utils.table_to_sheet(
      document.querySelector("#feature-report")
    )
    XLSX.utils.book_append_sheet(wb, ws3, "Feature")

    XLSX.writeFile(wb, "sprint.xlsx")
  }, [])
}
