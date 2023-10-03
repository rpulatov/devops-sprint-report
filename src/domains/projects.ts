import { TeamProjectReference } from "azure-devops-extension-api/Core"

import { fetchAzure } from "../api"

export async function getProjects() {
  return fetchAzure("/projects").then(
    (res: { count: number; value: TeamProjectReference[] }) => res.value
  )
}
