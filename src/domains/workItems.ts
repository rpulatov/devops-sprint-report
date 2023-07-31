import { TeamFieldValues } from 'azure-devops-extension-api/Work';
import {
  WorkItem,
  WorkItemQueryResult,
  WorkItemType,
  WorkItemUpdate,
} from 'azure-devops-extension-api/WorkItemTracking/WorkItemTracking';
import { GitPullRequest, GitPullRequestCommentThread } from 'azure-devops-extension-api/Git/index';

import { buildAzureWebUrl, fetchAzure, fetchAzureRawUrl } from '../api';

export async function getCompletedStates({ projectId }: { projectId: string }) {
  return fetchAzure(`/wit/workitemtypes`, {
    projectId,
  })
    .then((res: { count: number; value: WorkItemType[] }) => res.value)
    .then((workItemTypes) => {
      return workItemTypes.reduce((acc, item) => {
        acc.set(
          item.name,
          item.states
            .filter((state) =>
              ['Completed', 'Resolved'].includes(state.category)
            )
            .map((state) => state.name)
        );
        return acc;
      }, new Map<string, string[]>());
    });
}

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

export async function getWorkItemUpdatesById(workItemsId: number) {
  return fetchAzure(`/wit/workItems/${workItemsId}/updates`)
       .then((res: { value: WorkItemUpdate[] }) => res.value);
}

export async function getChildWorkItemsByParentId(workItemsId: number){
  const workItem = await getWorkItemsByIds([workItemsId]).then((res: WorkItem[]) => res[0]);
  return getChildWorkItemsByWorkItem(workItem);
}

export async function getChildWorkItemsByWorkItem(workItem: WorkItem){
  const children_relations = workItem
    .relations
    .filter((relation) => relation.rel === 'System.LinkTypes.Hierarchy-Forward')
    .filter((relation) => relation.attributes['name'] === 'Child');
    const children_ids = children_relations
    .map((relation) => parseWorkItemIdFromUrl(relation.url))
    .filter((id) => id !== null) as number[];
  return getWorkItemsByIds(children_ids);
}

export async function getRelatedPRsByWorkItemId(workItemsId: number){
  const workItem = await getWorkItemsByIds([workItemsId]).then((res: WorkItem[]) => res[0]);
  return getRelatedPRsByWorkItem(workItem);
}

export async function getRelatedPRsByWorkItem(workItem: WorkItem){
  const pr_ids = workItem
    .relations
    .filter((relation) => relation.rel === 'ArtifactLink')
    .filter((relation) => relation.attributes['name'] === 'Pull Request')
    .map((relation) => parsePRIdFromUrl(relation.url));
  return Promise.all(
    pr_ids.map(async (pr_id) => await fetchAzure(`/git/pullrequests/${pr_id}`))
  ).then((res) => res.map((item) => item as GitPullRequest));
}

export async function getPRThreadByPR(pr: GitPullRequest) {
  return fetchAzureRawUrl(`${pr.url}/threads`)
    .then((res: { value: GitPullRequestCommentThread[] }) => res.value);
}

function parsePRIdFromUrl(url: string) {
  const parts = url.split('%2F')
  const id = parts[parts.length - 1];
  return id;
}

type GetWorkItemsByWiql = { projectId: string | undefined; teamId: string | undefined; query: string };
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

export function getDataFromWorkItem(completedStates: Map<string, string[]>) {
  return function (item: WorkItem) {
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

    const workItemType: 'Task' | 'Bug' | 'User Story' | 'Feature' =
      item.fields['System.WorkItemType'];

    const isClosed =
      completedStates.get(workItemType)?.includes(state) || false;

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

export type WorkItemState = ReturnType<ReturnType<typeof getDataFromWorkItem>>;

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

  return workItemsRaw;
}

export function getWorkItemWebUrl(workItemId: number) {
  return buildAzureWebUrl(`_workitems/edit/${workItemId}`)
}