import { TeamProjectReference } from "azure-devops-extension-api/Core"

import { fetchAzure } from "../api"

export async function getProjects(organization: string) {
  return fetchAzure("/projects", organization).then(
    (res: { count: number; value: TeamProjectReference[] }) => res.value
  )
}
