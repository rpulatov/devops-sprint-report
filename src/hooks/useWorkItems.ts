import React from 'react';
import { errorNotification } from '../api/notificationObserver';
import {
  getCompletedStates,
  getDataFromWorkItem,
  getWorkItemsByIteration,
  WorkItemState,
} from '../domains/workItems';

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
  const [completedStates, setCompletedStates] = React.useState<
    Map<string, string[]>
  >(new Map());

  React.useEffect(() => {
    setWorkItems([]);

    const load = async () => {
      const completedStates = await getCompletedStates({ projectId });
      setCompletedStates(completedStates);

      const workItemsRaw = await getWorkItemsByIteration({
        projectId,
        teamId,
        iterationPath,
      });
      return workItemsRaw.map(getDataFromWorkItem(completedStates));
    };

    load().then(setWorkItems).catch(errorNotification);
  }, [projectId, teamId, iterationPath]);
  return {
    workItems,
    completedStates,
  };
}
