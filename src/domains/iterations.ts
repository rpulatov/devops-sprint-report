import React from 'react';
import { fetchAzure } from '../api';
import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';

type GetIterationsParams = { projectId: string };
async function getIterations({ projectId }: GetIterationsParams) {
  return fetchAzure('/work/teamsettings/iterations', { projectId }).then(
    (res: { count: number; value: TeamSettingsIteration[] }) => res.value
  );
}

export function useIterations({ projectId }: GetIterationsParams) {
  const [iterations, setIterations] = React.useState<TeamSettingsIteration[]>(
    []
  );
  React.useEffect(() => {
    getIterations({ projectId }).then((res) => setIterations(res));
  }, [projectId]);
  return {
    iterations,
  };
}
