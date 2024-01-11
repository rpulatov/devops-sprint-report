import React from "react"

import { useParams } from "react-router-dom"

import { TeamProjectReference } from "azure-devops-extension-api/Core"

import { errorNotification } from "../api/notificationObserver"
import { getProjects } from "../domains/projects"

export function useProjects(organization: string) {
  const [projects, setProjects] = React.useState<TeamProjectReference[]>([])
  React.useEffect(() => {
    getProjects(organization)
      .then(res => {
        res.sort((a, b) => {
          const nameA = a.name.toUpperCase()
          const nameB = b.name.toUpperCase()
          if (nameA < nameB) return -1
          if (nameA > nameB) return 1
          return 0
        })
        setProjects(res)
      })
      .catch(errorNotification)
  }, [organization])
  return {
    projects,
  }
}
