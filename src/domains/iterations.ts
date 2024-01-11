import { TeamSettingsIteration } from "azure-devops-extension-api/Work"

import { fetchAzure } from "../api"

export type GetIterationsParams = { projectId: string; organization: string }
export async function getIterations({
  projectId,
  organization,
}: GetIterationsParams) {
  return fetchAzure("/work/teamsettings/iterations", organization, {
    projectId,
  }).then((res: { count: number; value: TeamSettingsIteration[] }) => res.value)
}

export type GetIterationCapacitiesProps = {
  organization: string
  projectId: string
  iterationId: string
}
export async function getIterationCapacities({
  organization,
  projectId,
  iterationId,
}: GetIterationCapacitiesProps) {
  return fetchAzure(
    `/work/iterations/${iterationId}/iterationcapacities`,
    organization,
    {
      projectId,
    }
  ).then(
    (res: {
      teams: [
        {
          teamId: string
          teamCapacityPerDay: number
          teamTotalDaysOff: number
        },
      ]
      totalIterationCapacityPerDay: number
      totalIterationDaysOff: number
    }) => res
  )
}
