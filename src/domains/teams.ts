import { WebApiTeam } from 'azure-devops-extension-api/Core';
import React from 'react';
import { fetchAzure } from '../api';
import { errorNotification } from '../api/notificationObserver';

type GetTeamsParams = { projectId: string };
async function getTeams({ projectId }: GetTeamsParams) {
  return fetchAzure(`/projects/${projectId}/teams`).then(
    (res: { count: number; value: WebApiTeam[] }) => res.value
  );
}

export function useTeams({ projectId }: GetTeamsParams) {
  const [teams, setTeams] = React.useState<WebApiTeam[]>([]);
  React.useEffect(() => {
    setTeams([]);
    getTeams({ projectId })
      .then((res) => setTeams(res))
      .catch(errorNotification);
  }, [projectId]);
  return {
    teams,
  };
}
