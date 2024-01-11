import {
  TeamMemberCapacity,
  TeamSetting,
  TeamSettingsDaysOff,
} from "azure-devops-extension-api/Work"

import { fetchAzure } from "../api"

export type GetCapacityParams = {
  organization: string
  projectId: string
  teamId: string
  iterationId: string
}
export async function getCapacity({
  organization,
  projectId,
  teamId,
  iterationId,
}: GetCapacityParams) {
  return fetchAzure(
    `/work/teamsettings/iterations/${iterationId}/capacities`,
    organization,
    {
      projectId,
      teamId,
    }
  ).then((res: { teamMembers: TeamMemberCapacity[] }) => res.teamMembers)
}

export async function getTeamDaysOff({
  organization,
  projectId,
  teamId,
  iterationId,
}: GetCapacityParams) {
  return fetchAzure(
    `/work/teamsettings/iterations/${iterationId}/teamdaysoff`,
    organization,
    {
      projectId,
      teamId,
    }
  ).then((res: TeamSettingsDaysOff) => res)
}

const days = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]

export type GetTeamSettings = {
  organization: string
  projectId: string
}
export async function getTeamSettings({
  organization,
  projectId,
}: GetTeamSettings) {
  return fetchAzure(`/work/teamsettings`, organization, {
    projectId,
  }).then((res: { workingDays: Array<string> }) =>
    res.workingDays.map(item => days.indexOf(item))
  )
}
