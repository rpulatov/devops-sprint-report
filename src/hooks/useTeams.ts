import React from "react"

import { WebApiTeam } from "azure-devops-extension-api/Core"

import { errorNotification } from "../api/notificationObserver"
import { GetTeamsParams, getTeams } from "../domains/teams"

export function useTeams({ organization, projectId }: GetTeamsParams) {
  const [teams, setTeams] = React.useState<WebApiTeam[]>([])
  React.useEffect(() => {
    setTeams([])
    getTeams({ organization, projectId })
      .then(res => setTeams(res))
      .catch(errorNotification)
  }, [projectId])
  return {
    teams,
  }
}
