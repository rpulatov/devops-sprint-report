import { useMemo } from "react"

import { TeamMember } from "../domains/teammembers"
import { WorkItemState } from "../domains/workItems"

export type TeamReportRow = {
  id: string
  name: string
  capacity: number
  planEstimate: number
  planComplete: number
  planRemaining: number
  overplanEstimate: number
  overplanComplete: number
  overplanRemaining: number
}

export function useTeamReport({
  workItems,
  teamMembers,
}: {
  workItems: WorkItemState[]
  teamMembers: TeamMember[]
}) {
  const teamReport = useMemo(() => {
    const teamReportObj = teamMembers.reduce(
      (acc: { [key: string]: TeamReportRow }, item) => {
        if (item.capacity > 0)
          acc[item.id] = {
            ...item,
            planEstimate: 0,
            planComplete: 0,
            planRemaining: 0,
            overplanEstimate: 0,
            overplanComplete: 0,
            overplanRemaining: 0,
          }
        return acc
      },
      {}
    )

    for (const item of workItems) {
      const linkToTeamReportRow = teamReportObj[item?.assignedTo?.id]
      if (!linkToTeamReportRow) continue
      if (item.overplan) {
        linkToTeamReportRow.overplanEstimate += item.originalEstimate
        linkToTeamReportRow.overplanRemaining += item.remainingWork
        linkToTeamReportRow.overplanComplete += item.completedWork
      } else {
        linkToTeamReportRow.planEstimate += item.originalEstimate
        linkToTeamReportRow.planRemaining += item.remainingWork
        linkToTeamReportRow.planComplete += item.completedWork
      }
    }

    return Object.values(teamReportObj)
  }, [workItems, teamMembers])

  const total = useMemo(
    () =>
      teamReport.reduce(
        (acc, item) => {
          acc.capacity += item.capacity
          acc.planEstimate += item.planEstimate
          acc.planComplete += item.planComplete
          acc.planRemaining += item.planRemaining
          acc.overplanComplete += item.overplanComplete
          acc.overplanEstimate += item.overplanEstimate
          acc.overplanRemaining += item.overplanRemaining
          return acc
        },
        {
          capacity: 0,
          planEstimate: 0,
          planComplete: 0,
          planRemaining: 0,
          overplanComplete: 0,
          overplanEstimate: 0,
          overplanRemaining: 0,
          percentageLoad: 0,
          estimationAccuracy: 0,
          percentageProductivity: 0,
        }
      ),
    [teamReport]
  )

  return { teamReport, total }
}
