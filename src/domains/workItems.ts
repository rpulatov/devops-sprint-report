import { WebApiTeam } from 'azure-devops-extension-api/Core';
import { TeamFieldValues } from 'azure-devops-extension-api/Work';
import {
  WorkItem,
  WorkItemQueryResult,
} from 'azure-devops-extension-api/WorkItemTracking/WorkItemTracking';
import React from 'react';
import { fetchAzure } from '../api';

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
  const [areaPath, setAreaPath] = React.useState<string | null>(null);
  const [workItems, setWorkItems] = React.useState<
    ReturnType<typeof getDataFromWorkItem>[]
  >([]);

  React.useEffect(() => {
    getTeamFieldValues({ projectId, teamId }).then((res) =>
      setAreaPath(res.defaultValue)
    );
  }, [projectId, teamId]);

  React.useEffect(() => {
    if (!areaPath) return undefined;

    const query = `SELECT [System.Id] 
                     FROM WorkItem 
                    WHERE ([System.WorkItemType] IN GROUP 'Microsoft.TaskCategory' OR [System.WorkItemType] IN GROUP 'Microsoft.BugCategory' OR [System.WorkItemType] IN GROUP 'Microsoft.RequirementCategory') 
                      AND [System.State] NOT IN ('Removed') 
                      AND [System.IterationPath] UNDER '${iterationPath}'  
                      AND ([System.AreaPath] = '${areaPath}' )`;

    getWorkItemsByWiql({ projectId, teamId, query })
      .then((res) => res.map(getDataFromWorkItem))
      .then((res) => setWorkItems(res));
  }, [projectId, teamId, iterationPath, areaPath]);
  return {
    workItems,
  };
}
