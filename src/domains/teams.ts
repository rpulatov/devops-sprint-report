import { WebApiTeam } from "azure-devops-extension-api/Core"

import { fetchAzure } from "../api"

export type GetTeamsParams = { organization: string; projectId: string }
export async function getTeams({ organization, projectId }: GetTeamsParams) {
  return fetchAzure(`/projects/${projectId}/teams`, organization).then(
    (res: { count: number; value: WebApiTeam[] }) => res.value
  )
}
