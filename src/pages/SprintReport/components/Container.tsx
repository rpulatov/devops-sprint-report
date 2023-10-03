import { TeamSettingsIteration } from "azure-devops-extension-api/Work"

import { useTeamMembers } from "../../../hooks/useTeamMembers"
import { useWorkItems } from "../../../hooks/useWorkItems"
import { TypeReport } from "../../../types/report"
import { useUserStoryReport } from "../hooks/useUserStoryReport"
import { FeatureReport } from "./FeatureReport"
import { TeamReport } from "./TeamReport"
import { UserStoryReport } from "./UserStoryReport"

type ContainerProps = {
  projectId: string
  teamId: string
  iteration: TeamSettingsIteration
  typeReport: TypeReport
}
export function Container({
  projectId,
  teamId,
  iteration,
  typeReport,
}: ContainerProps) {
  const { teamMembers } = useTeamMembers({
    iteration,
    projectId,
    teamId,
  })

  const { workItems, completedStates } = useWorkItems({
    projectId,
    teamId,
    iterationPath: iteration.path,
  })

  const { userStories } = useUserStoryReport({ workItems, completedStates })

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
