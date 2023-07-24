import React from 'react';

import { TeamProjectReference } from 'azure-devops-extension-api/Core';
import { errorNotification } from '../api/notificationObserver';
import { getProjects } from '../domains/projects';

export function useProjects() {
  const [projects, setProjects] = React.useState<TeamProjectReference[]>([]);
  React.useEffect(() => {
    getProjects()
      .then((res) => {
        res.sort((a, b) => {
          const nameA = a.name.toUpperCase();
          const nameB = b.name.toUpperCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        });
        setProjects(res);
      })
      .catch(errorNotification);
  }, []);
  return {
    projects,
  };
}
