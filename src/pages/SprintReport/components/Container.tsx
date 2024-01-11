import React from "react"

import { TeamSettingsIteration } from "azure-devops-extension-api/Work"

import { errorNotification } from "../../../api/notificationObserver"
import { getIterationCapacities } from "../../../domains"
import { TeamMember, getTeamMembers } from "../../../domains/teammembers"
import { useOrganization } from "../../../hooks/useOrganization"
import { useWorkItems } from "../../../hooks/useWorkItems"
import { TypeReport } from "../../../types/report"
import { useUserStoryReport } from "../hooks/useUserStoryReport"
import { FeatureReport } from "./FeatureReport"
import { TeamReport } from "./TeamReport"
import { UserStoryReport } from "./UserStoryReport"

type ContainerProps = {
  projectId: string
  iteration: TeamSettingsIteration
  typeReport: TypeReport
}
export function Container({
  projectId,
  iteration,
  typeReport,
}: ContainerProps) {
  const { organization } = useOrganization()

  console.info({ organization })
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([])
  const [teams, setTeams] = React.useState<
    {
      teamId: string
    }[]
  >([])

  React.useEffect(() => {
    const load = async () => {
      const { teams } = await getIterationCapacities({
        organization,
        projectId,
        iterationId: iteration.id,
      })

      const teamMembers = await Promise.all(
        teams.map(({ teamId }) =>
          getTeamMembers({ organization, iteration, projectId, teamId })
        )
      ).then(res => res.flat())

      setTeamMembers(teamMembers)
      setTeams(teams)
    }

    load().catch(errorNotification)
  }, [iteration, projectId])

  const { workItems, completedStates } = useWorkItems({
    organization,
    projectId,
    teams,
    iterationPath: iteration.path,
  })

  const { userStories } = useUserStoryReport({
    organization,
    workItems,
    completedStates,
  })

  return (
    <div>
      <TeamReport
        teamMembers={teamMembers}
        workItems={workItems}
        typeReport={typeReport}
        htmlIdElement="team-report"
      />
      <br />
      <br />
      <UserStoryReport
        projectId={projectId}
        userStories={userStories}
        typeReport={typeReport}
        htmlIdElement="user-story-report"
      />
      <br />
      <br />
      <FeatureReport
        userStories={userStories}
        typeReport={typeReport}
        htmlIdElement="feature-report"
      />
    </div>
  )
}
