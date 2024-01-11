import {
  GitPullRequest,
  GitPullRequestCommentThread,
} from "azure-devops-extension-api/Git/index"
import { TeamFieldValues } from "azure-devops-extension-api/Work"
import {
  WorkItem,
  WorkItemQueryResult,
  WorkItemType,
  WorkItemUpdate,
} from "azure-devops-extension-api/WorkItemTracking/WorkItemTracking"

import { buildAzureWebUrl, fetchAzure, fetchAzureRawUrl } from "../api"

export async function getCompletedStates({
  organization,
  projectId,
}: {
  organization: string
  projectId: string
}) {
  return fetchAzure(`/wit/workitemtypes`, organization, {
    projectId,
  })
    .then((res: { count: number; value: WorkItemType[] }) => res.value)
    .then(workItemTypes => {
      return workItemTypes.reduce((acc, item) => {
        acc.set(
          item.name,
          item.states
            .filter(state => ["Completed", "Resolved"].includes(state.category))
            .map(state => state.name)
        )
        return acc
      }, new Map<string, string[]>())
    })
}

type GetTeamFieldValues = {
  organization: string
  projectId: string
  teamId: string
}
export async function getTeamFieldValues({
  organization,
  projectId,
  teamId,
}: GetTeamFieldValues) {
  return fetchAzure(`/work/teamsettings/teamfieldvalues`, organization, {
    projectId,
    teamId,
  }).then((res: TeamFieldValues) => res)
}

export async function getWorkItemsByIds(
  organization: string,
  workItemsIds: number[]
) {
  const chunkSize = 200
  const chunksIds: string[] = []
  for (let i = 0; i < workItemsIds.length; i += chunkSize) {
    const chunk = workItemsIds.slice(i, i + chunkSize)
    chunksIds.push(chunk.join(","))
  }

  return Promise.all(
    chunksIds.map(ids =>
      fetchAzure("/wit/workItems", organization, {
        parameters: { ids, $expand: "relations" },
      })
    )
  ).then((res: { value: WorkItem[] }[]) => res.flatMap(item => item.value))
}

export async function getWorkItemUpdatesById(
  organization: string,
  workItemsId: number
) {
  return fetchAzure(`/wit/workItems/${workItemsId}/updates`, organization).then(
    (res: { value: WorkItemUpdate[] }) => res.value
  )
}

export async function getChildWorkItemsByParentId(
  organization: string,
  workItemsId: number
) {
  const workItem = await getWorkItemsByIds(organization, [workItemsId]).then(
    (res: WorkItem[]) => res[0]
  )
  return getChildWorkItemsByWorkItem(organization, workItem)
}

export async function getChildWorkItemsByWorkItem(
  organization: string,
  workItem: WorkItem
) {
  const children_relations = workItem.relations
    .filter(relation => relation.rel === "System.LinkTypes.Hierarchy-Forward")
    .filter(relation => relation.attributes["name"] === "Child")
  const children_ids = children_relations
    .map(relation => parseWorkItemIdFromUrl(relation.url))
    .filter(id => id !== null) as number[]
  return getWorkItemsByIds(organization, children_ids)
}

export async function getRelatedPRsByWorkItemId(
  organization: string,
  workItemsId: number
) {
  const workItem = await getWorkItemsByIds(organization, [workItemsId]).then(
    (res: WorkItem[]) => res[0]
  )
  return getRelatedPRsByWorkItem(organization, workItem)
}

export async function getRelatedPRsByWorkItem(
  organization: string,
  workItem: WorkItem
) {
  const pr_ids = workItem.relations
    .filter(relation => relation.rel === "ArtifactLink")
    .filter(relation => relation.attributes["name"] === "Pull Request")
    .map(relation => parsePRIdFromUrl(relation.url))
  return Promise.all(
    pr_ids.map(
      async pr_id =>
        await fetchAzure(`/git/pullrequests/${pr_id}`, organization)
    )
  ).then(res => res.map(item => item as GitPullRequest))
}

export async function getPRThreadByPR(pr: GitPullRequest) {
  return fetchAzureRawUrl(`${pr.url}/threads`).then(
    (res: { value: GitPullRequestCommentThread[] }) => res.value
  )
}

function parsePRIdFromUrl(url: string) {
  const parts = url.split("%2F")
  const id = parts[parts.length - 1]
  return id
}

type GetWorkItemsByWiql = {
  organization: string
  projectId: string | undefined
  teamId: string | undefined
  query: string
}
export async function getWorkItemsByWiql({
  organization,
  projectId,
  teamId,
  query,
}: GetWorkItemsByWiql) {
  return fetchAzure(`/wit/wiql`, organization, {
    projectId,
    teamId,
    method: "POST",
    body: JSON.stringify({ query }),
  })
    .then((res: WorkItemQueryResult) => res.workItems)
    .then(workItems => {
      if (workItems.length === 0) return []
      const workItemsIds = workItems.map(item => item.id)
      return getWorkItemsByIds(organization, workItemsIds)
    })
}

function parseWorkItemIdFromUrl(url: string | null) {
  if (!url) return null
  const matchData = url.match(/\/(\d*)$/)
  if (!matchData || matchData.length < 2) return null
  return Number(matchData[1])
}

export function getShortDataFromWorkItem() {
  return function (item: WorkItem) {
    const assignedTo = item.fields["System.AssignedTo"]
      ? (item.fields["System.AssignedTo"] as {
          displayName: string
          id: string
        })
      : undefined
    const originalEstimate = Number(
      item.fields["Microsoft.VSTS.Scheduling.OriginalEstimate"] ?? 0
    )
    const remainingWork = Number(
      item.fields["Microsoft.VSTS.Scheduling.RemainingWork"] ?? 0
    )
    const completedWork = Number(
      item.fields["Microsoft.VSTS.Scheduling.CompletedWork"] ?? 0
    )

    return {
      assignedTo,
      originalEstimate,
      remainingWork,
      completedWork,
    }
  }
}

export function getDataFromWorkItem(completedStates: Map<string, string[]>) {
  return function (item: WorkItem) {
    const id = item.id
    const name = item.fields["System.Title"] as string
    const overplan = Boolean(item.fields["Custom.Overplan"] ?? false)
    const assignedTo = item.fields["System.AssignedTo"] as {
      displayName: string
      id: string
    }
    const originalEstimate = Number(
      item.fields["Microsoft.VSTS.Scheduling.OriginalEstimate"] ?? 0
    )
    const remainingWork = Number(
      item.fields["Microsoft.VSTS.Scheduling.RemainingWork"] ?? 0
    )
    const completedWork = Number(
      item.fields["Microsoft.VSTS.Scheduling.CompletedWork"] ?? 0
    )

    const state = (item.fields["System.State"] ?? "New") as string

    const workItemType: "Task" | "Bug" | "User Story" | "Feature" =
      item.fields["System.WorkItemType"]

    const isClosed = completedStates.get(workItemType)?.includes(state) || false

    const relationReverse = item.relations?.find(
      rel => rel.rel === "System.LinkTypes.Hierarchy-Reverse"
    )

    const parentLink = relationReverse?.url ?? null
    const parentWorkItemId = parseWorkItemIdFromUrl(parentLink)

    const order = item.fields["Microsoft.VSTS.Common.StackRank"] as number

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
    }
  }
}

export type CreateQueryWiql = {
  iterationPath: string
  areaPath: string
}
function createQueryWiql({ iterationPath, areaPath }: CreateQueryWiql) {
  return `SELECT [System.Id] 
  FROM WorkItem 
 WHERE ([System.WorkItemType] IN GROUP 'Microsoft.TaskCategory' OR [System.WorkItemType] IN GROUP 'Microsoft.BugCategory' OR [System.WorkItemType] IN GROUP 'Microsoft.RequirementCategory') 
   AND [System.State] NOT IN ('Removed') 
   AND [System.IterationPath] UNDER '${iterationPath}'  
   AND ([System.AreaPath] = '${areaPath}' )`
}

export type WorkItemState = ReturnType<ReturnType<typeof getDataFromWorkItem>>

export type GetWorkItemsByIterationParams = {
  organization: string
  projectId: string
  teamId: string
  iterationPath: string
}
export async function getWorkItemsByIteration({
  organization,
  projectId,
  teamId,
  iterationPath,
}: GetWorkItemsByIterationParams) {
  const teamFieldValues = await getTeamFieldValues({
    organization,
    projectId,
    teamId,
  })
  const areaPath = teamFieldValues.defaultValue
  const query = createQueryWiql({ iterationPath, areaPath })
  const workItemsRaw = await getWorkItemsByWiql({
    organization,
    projectId,
    teamId,
    query,
  })

  return workItemsRaw
}

export function getWorkItemWebUrl(organization: string, workItemId: number) {
  return buildAzureWebUrl(organization, `_workitems/edit/${workItemId}`)
}
