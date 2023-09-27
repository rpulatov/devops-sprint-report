import { WebApiTeam } from "azure-devops-extension-api/Core";
import { fetchAzure } from "../api";

export type GetTeamsParams = { projectId: string };
export async function getTeams({ projectId }: GetTeamsParams) {
  return fetchAzure(`/projects/${projectId}/teams`).then(
    (res: { count: number; value: WebApiTeam[] }) => res.value
  );
}
