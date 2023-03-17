import React from 'react';

import { TeamProjectReference } from 'azure-devops-extension-api/Core';
import { errorNotification } from '../api/notificationObserver';
import { getProjects } from '../domains/projects';

export function useProjects() {
  const [projects, setProjects] = React.useState<TeamProjectReference[]>([]);
  React.useEffect(() => {
    getProjects()
      .then((res) => setProjects(res))
      .catch(errorNotification);
  }, []);
  return {
    projects,
  };
}
