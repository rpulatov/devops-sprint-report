import { fetchAzure } from '../api';
import { TeamProjectReference } from 'azure-devops-extension-api/Core';

export async function getProjects() {
  return fetchAzure('/projects').then(
    (res: { count: number; value: TeamProjectReference[] }) => res.value
  );
}
