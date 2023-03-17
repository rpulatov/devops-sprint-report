import { WebApiTeam } from 'azure-devops-extension-api/Core';
import React from 'react';

import { errorNotification } from '../api/notificationObserver';
import { getTeams, GetTeamsParams } from '../domains/teams';

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
