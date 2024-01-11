import { CommentList } from "azure-devops-extension-api/WorkItemTracking"

import { fetchAzure } from "../api"

export async function getComments(projectId: string, workItemId: number) {
  return fetchAzure(`/wit/workItems/${workItemId}/comments`, {
    projectId,
    apiVersion: "7.1-preview.4",
  }).then((res: CommentList) => res)
}
