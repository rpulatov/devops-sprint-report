import React from "react"

import { TeamSettingsIteration } from "azure-devops-extension-api/Work"

import { fetchAzure } from "../api"
import { errorNotification } from "../api/notificationObserver"
import { GetIterationsParams, getIterations } from "../domains/iterations"

export function useIterations({ projectId }: GetIterationsParams) {
  const [iterations, setIterations] = React.useState<TeamSettingsIteration[]>(
    []
  )
  React.useEffect(() => {
    setIterations([])
    getIterations({ projectId })
      .then(res => setIterations(res))
      .catch(errorNotification)
  }, [projectId])
  return {
    iterations,
  }
}
