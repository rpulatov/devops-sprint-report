import React from "react"

import { errorNotification } from "../api/notificationObserver"
import {
  WorkItemState,
  getCompletedStates,
  getDataFromWorkItem,
  getWorkItemsByIteration,
} from "../domains/workItems"

type UseWorkItems = {
  organization: string
  projectId: string
  teams: { teamId: string }[]
  iterationPath: string
}
export function useWorkItems({
  organization,
  projectId,
  teams,
  iterationPath,
}: UseWorkItems) {
  const [workItems, setWorkItems] = React.useState<WorkItemState[]>([])
  const [completedStates, setCompletedStates] = React.useState<
    Map<string, string[]>
  >(new Map())

  React.useEffect(() => {
    setWorkItems([])

    const load = async () => {
      const completedStates = await getCompletedStates({
        organization,
        projectId,
      })
      setCompletedStates(completedStates)

      const workItemsRaw = await Promise.all(
        teams.map(({ teamId }) =>
          getWorkItemsByIteration({
            organization,
            projectId,
            iterationPath,
            teamId,
          })
        )
      ).then(res => res.flat())

      return workItemsRaw.map(getDataFromWorkItem(completedStates))
    }

    load().then(setWorkItems).catch(errorNotification)
  }, [organization, projectId, teams, iterationPath])
  return {
    workItems,
    completedStates,
  }
}
