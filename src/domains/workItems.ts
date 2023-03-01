import { TeamFieldValues } from 'azure-devops-extension-api/Work';
import {
  WorkItem,
  WorkItemQueryResult,
} from 'azure-devops-extension-api/WorkItemTracking/WorkItemTracking';
import React from 'react';
import { fetchAzure } from '../api';
import { errorNotification } from '../api/notificationObserver';

type GetTeamFieldValues = {
  projectId: string;
  teamId: string;
};
async function getTeamFieldValues({ projectId, teamId }: GetTeamFieldValues) {
  return fetchAzure(`/work/teamsettings/teamfieldvalues`, {
    projectId,
    teamId,
  }).then((res: TeamFieldValues) => res);
}

type GetWorkItemsByWiql = { projectId: string; teamId: string; query: string };
async function getWorkItemsByWiql({
  projectId,
  teamId,
  query,
}: GetWorkItemsByWiql) {
  return fetchAzure(`/wit/wiql`, {
    projectId,
    teamId,
    method: 'POST',
    body: JSON.stringify({ query }),
  })
    .then((res: WorkItemQueryResult) => res.workItems)
    .then((workItems) => {
      if (workItems.length === 0)
        return Promise.reject(new Error('No work items'));
      const ids = workItems.map((item) => item.id).join(',');
      return fetchAzure('/wit/workItems', {
        parameters: { ids },
      });
    })
    .then((res: { value: WorkItem[] }) => res.value);
}

function getDataFromWorkItem(item: WorkItem) {
  const overplan = Boolean(item.fields['Custom.Overplan'] ?? false);
  const assignedTo = item.fields['System.AssignedTo'] as {
    displayName: string;
    id: string;
  };
  const originalEstimate = Number(
    item.fields['Microsoft.VSTS.Scheduling.OriginalEstimate'] ?? 0
  );
  const remainingWork = Number(
    item.fields['Microsoft.VSTS.Scheduling.RemainingWork'] ?? 0
  );
  const completedWork = Number(
    item.fields['Microsoft.VSTS.Scheduling.CompletedWork'] ?? 0
  );

  const isClosed = ['Closed', 'In QA', 'Ready for Merge', 'Resolved'].includes(
    item.fields['System.State'] ?? 'New'
  );

  return {
    overplan,
    assignedTo,
    originalEstimate,
    remainingWork,
    completedWork,
    isClosed,
  };
}

type CreateQueryWiql = {
  iterationPath: string;
  areaPath: string;
};
function createQueryWiql({ iterationPath, areaPath }: CreateQueryWiql) {
  return `SELECT [System.Id] 
  FROM WorkItem 
 WHERE ([System.WorkItemType] IN GROUP 'Microsoft.TaskCategory' OR [System.WorkItemType] IN GROUP 'Microsoft.BugCategory' OR [System.WorkItemType] IN GROUP 'Microsoft.RequirementCategory') 
   AND [System.State] NOT IN ('Removed') 
   AND [System.IterationPath] UNDER '${iterationPath}'  
   AND ([System.AreaPath] = '${areaPath}' )`;
}

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
  const [workItems, setWorkItems] = React.useState<
    ReturnType<typeof getDataFromWorkItem>[]
  >([]);

  React.useEffect(() => {
    const update = async () => {
      const teamFieldValues = await getTeamFieldValues({ projectId, teamId });
      const areaPath = teamFieldValues.defaultValue;
      const query = createQueryWiql({ iterationPath, areaPath });
      const workItemsRaw = await getWorkItemsByWiql({
        projectId,
        teamId,
        query,
      });
      const result = workItemsRaw.map(getDataFromWorkItem);
      setWorkItems(result);
    };

    setWorkItems([]);
    update().catch(errorNotification);
  }, [projectId, teamId, iterationPath]);
  return {
    workItems,
  };
}
