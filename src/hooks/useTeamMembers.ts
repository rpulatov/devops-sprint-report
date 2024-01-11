import React from "react"

import { errorNotification } from "../api/notificationObserver"
import {
  GetTeamMembersParams,
  TeamMember,
  getTeamMembers,
} from "../domains/teammembers"

export function useTeamMembers({
  organization,
  iteration,
  projectId,
  teamId,
}: GetTeamMembersParams) {
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([])
  React.useEffect(() => {
    setTeamMembers([])
    getTeamMembers({ organization, projectId, iteration, teamId })
      .then(setTeamMembers)
      .catch(errorNotification)
  }, [projectId, iteration, teamId])
  return { teamMembers }
}
