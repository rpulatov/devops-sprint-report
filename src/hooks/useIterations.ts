import React from 'react';
import { fetchAzure } from '../api';
import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';
import { errorNotification } from '../api/notificationObserver';
import { getIterations, GetIterationsParams } from '../domains/iterations';

export function useIterations({ projectId }: GetIterationsParams) {
  const [iterations, setIterations] = React.useState<TeamSettingsIteration[]>(
    []
  );
  React.useEffect(() => {
    setIterations([]);
    getIterations({ projectId })
      .then((res) => setIterations(res))
      .catch(errorNotification);
  }, [projectId]);
  return {
    iterations,
  };
}
