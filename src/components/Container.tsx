import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';
import { useTeamMembers } from '../hooks/useTeamMembers';

import { useWorkItems } from '../hooks/useWorkItems';
import { useUserStories } from '../hooks/useUserStories';
import { TypeReport } from '../types/report';

import { TeamReport } from './TeamReport';
import { UserStoryReport } from './UserStoryReport';
import { FeatureReport } from './FeatureReport';

type ContainerProps = {
  projectId: string;
  teamId: string;
  iteration: TeamSettingsIteration;
  typeReport: TypeReport;
};
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
  });

  const { workItems } = useWorkItems({
    projectId,
    teamId,
    iterationPath: iteration.path,
  });

  const { userStories } = useUserStories({ workItems });
  return (
    <div>
      <TeamReport
        teamMembers={teamMembers}
        workItems={workItems}
        typeReport={typeReport}
      />
      <br />
      <br />
      <UserStoryReport userStories={userStories} typeReport={typeReport} />
      <br />
      <br />
      <FeatureReport userStories={userStories} typeReport={typeReport} />
    </div>
  );
}