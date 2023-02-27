import { WebApiTeam } from 'azure-devops-extension-api/Core';
import React from 'react';
import { fetchAzure } from '../api';

type GetTeamsParams = { projectId: string };
async function getTeams({ projectId }: GetTeamsParams) {
  return fetchAzure(`/projects/${projectId}/teams`).then(
    (res: { count: number; value: WebApiTeam[] }) => res.value
  );
}

export function useTeams({ projectId }: GetTeamsParams) {
  const [teams, setTeams] = React.useState<WebApiTeam[]>([]);
  React.useEffect(() => {
    getTeams({ projectId }).then((res) => setTeams(res));
  }, [projectId]);
  return {
    teams,
  };
}
