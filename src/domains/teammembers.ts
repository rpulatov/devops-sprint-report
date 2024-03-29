import { TeamSettingsIteration } from "azure-devops-extension-api/Work"

import { diffInDays, getDatesArray, getNameOfDay, isDayInRange } from "../utils"
import {
  GetCapacityParams,
  getCapacity,
  getTeamDaysOff,
  getTeamSettings,
} from "./teamsettings"

export type TeamMember = {
  id: string
  name: string
  capacity: number
  capacityPerDay: number
  workDays: Date[]
}

export type GetTeamMembersParams = {
  organization: string
  iteration: TeamSettingsIteration
  projectId: string
  teamId: string
}
export async function getTeamMembers({
  organization,
  iteration,
  projectId,
  teamId,
}: GetTeamMembersParams): Promise<TeamMember[]> {
  const data = await Promise.all([
    getCapacity({ organization, projectId, teamId, iterationId: iteration.id }),
    getTeamDaysOff({
      organization,
      projectId,
      teamId,
      iterationId: iteration.id,
    }),
    getTeamSettings({ organization, projectId }),
  ])

  const [capacity, teamDaysOff, teamWorkingDays] = data

  const iterationDays = getDatesArray(
    new Date(iteration.attributes.startDate),
    new Date(iteration.attributes.finishDate)
  )

  const workDaysOfTeam = iterationDays.reduce((workDaysAcc, iterationDay) => {
    if (isDayInRange(teamDaysOff.daysOff, iterationDay)) return workDaysAcc

    if (!teamWorkingDays.includes(iterationDay.getDay())) return workDaysAcc

    workDaysAcc.push(iterationDay)
    return workDaysAcc
  }, new Array<Date>())

  const teamMembers = capacity.map(item => {
    let workDays = workDaysOfTeam
    if (item.daysOff.length > 0) {
      workDays = workDaysOfTeam.filter(
        workDay => !isDayInRange(item.daysOff, workDay)
      )
    }

    const allCapacityPerDay = item.activities.reduce(
      (acc, value) => acc + value.capacityPerDay,
      0
    )

    return {
      id: item.teamMember.id,
      name: item.teamMember.displayName,
      /** общий за спринт */
      capacity: workDays.length * allCapacityPerDay,
      /** на один рабочий день */
      capacityPerDay: allCapacityPerDay,
      workDays,
    }
  })

  return teamMembers
}
