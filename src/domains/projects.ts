import React from 'react';
import { fetchAzure } from '../api';
import { TeamProjectReference } from 'azure-devops-extension-api/Core';
async function getProjects() {
  return fetchAzure('/projects').then(
    (res: { count: number; value: TeamProjectReference[] }) => res.value
  );
}

export function useProjects() {
  const [projects, setProjects] = React.useState<TeamProjectReference[]>([]);
  React.useEffect(() => {
    getProjects().then((res) => setProjects(res));
  }, []);
  return {
    projects,
  };
}
