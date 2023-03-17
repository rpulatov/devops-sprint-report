import React from 'react';
import { errorNotification } from '../api/notificationObserver';
import { getWorkItemsByIteration, WorkItemState } from '../domains/workItems';

type UseWorkItems = {
  projectId: string;
  teamId: string;
  iterationPath: string;
};
export function useWorkItems({
  projectId,
  teamId,
  iterationPath,
}: UseWorkItems) {
  const [workItems, setWorkItems] = React.useState<WorkItemState[]>([]);

  React.useEffect(() => {
    setWorkItems([]);
    getWorkItemsByIteration({ projectId, teamId, iterationPath })
      .then(setWorkItems)
      .catch(errorNotification);
  }, [projectId, teamId, iterationPath]);
  return {
    workItems,
  };
}
