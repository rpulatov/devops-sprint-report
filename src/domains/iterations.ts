import { fetchAzure } from '../api';
import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';

export type GetIterationsParams = { projectId: string };
export async function getIterations({ projectId }: GetIterationsParams) {
  return fetchAzure('/work/teamsettings/iterations', { projectId }).then(
    (res: { count: number; value: TeamSettingsIteration[] }) => res.value
  );
}
