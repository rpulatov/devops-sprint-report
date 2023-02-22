import { TeamProjectReference } from 'azure-devops-node-api/interfaces/CoreInterfaces';
import React from 'react';
import { client } from '../api';

async function getProjects() {
  await client.connect();
  const coreApi = await client.getCoreApi();
  return await coreApi.getProjects();
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
