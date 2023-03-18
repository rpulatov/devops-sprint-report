import { TeamFieldValues } from 'azure-devops-extension-api/Work';
import {
  WorkItem,
  WorkItemQueryResult,
} from 'azure-devops-extension-api/WorkItemTracking/WorkItemTracking';
import { fetchAzure } from '../api';

type GetTeamFieldValues = {
  projectId: string;
  teamId: string;
};
export async function getTeamFieldValues({
  projectId,
  teamId,
}: GetTeamFieldValues) {
  return fetchAzure(`/work/teamsettings/teamfieldvalues`, {
    projectId,
    teamId,
  }).then((res: TeamFieldValues) => res);
}

export async function getWorkItemsByIds(workItemsIds: number[]) {
  const chunkSize = 200;
  const chunksIds: string[] = [];
  for (let i = 0; i < workItemsIds.length; i += chunkSize) {
    const chunk = workItemsIds.slice(i, i + chunkSize);
    chunksIds.push(chunk.join(','));
  }

  return Promise.all(
    chunksIds.map((ids) =>
      fetchAzure('/wit/workItems', {
        parameters: { ids, $expand: 'relations' },
      })
    )
  ).then((res: { value: WorkItem[] }[]) => res.flatMap((item) => item.value));
}

type GetWorkItemsByWiql = { projectId: string; teamId: string; query: string };
export async function getWorkItemsByWiql({
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
      const workItemsIds = workItems.map((item) => item.id);
      return getWorkItemsByIds(workItemsIds);
    });
}

function parseWorkItemIdFromUrl(url: string | null) {
  if (!url) return null;
  const matchData = url.match(/\/(\d*)$/);
  if (!matchData || matchData.length < 2) return null;
  return Number(matchData[1]);
}

export function getDataFromWorkItem(item: WorkItem) {
  const id = item.id;
  const name = item.fields['System.Title'] as string;
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

  const state = (item.fields['System.State'] ?? 'New') as string;

  const isClosed = ['Closed', 'In QA', 'Ready for Merge', 'Resolved'].includes(
    state
  );

  const workItemType: 'Task' | 'Bug' | 'User Story' | 'Feature' =
    item.fields['System.WorkItemType'];

  const relationReverse = item.relations?.find(
    (rel) => rel.rel === 'System.LinkTypes.Hierarchy-Reverse'
  );

  const parentLink = relationReverse?.url ?? null;
  const parentWorkItemId = parseWorkItemIdFromUrl(parentLink);

  const order = item.fields['Microsoft.VSTS.Common.StackRank'] as number;

  return {
    id,
    name,
    overplan,
    assignedTo,
    originalEstimate,
    remainingWork,
    completedWork,
    state,
    isClosed,
    workItemType,
    parentLink,
    parentWorkItemId,
    order,
  };
}

export type CreateQueryWiql = {
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

export type WorkItemState = ReturnType<typeof getDataFromWorkItem>;

export type GetWorkItemsByIterationParams = {
  projectId: string;
  teamId: string;
  iterationPath: string;
};
export async function getWorkItemsByIteration({
  projectId,
  teamId,
  iterationPath,
}: GetWorkItemsByIterationParams) {
  const teamFieldValues = await getTeamFieldValues({ projectId, teamId });
  const areaPath = teamFieldValues.defaultValue;
  const query = createQueryWiql({ iterationPath, areaPath });
  const workItemsRaw = await getWorkItemsByWiql({
    projectId,
    teamId,
    query,
  });
  return workItemsRaw.map(getDataFromWorkItem);
}
