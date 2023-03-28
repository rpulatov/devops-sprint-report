import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';
import { useCallback, useMemo } from 'react';
import { useTeamMembers } from '../hooks/useTeamMembers';

import { useWorkItems } from '../hooks/useWorkItems';
import { TypeReport } from '../types/report';

import { diffInDays } from '../utils';
import { TeamReport } from './TeamReport';
import { UserStoryReport } from './UserStoryReport';

type DataLayerProps = {
  projectId: string;
  teamId: string;
  iteration: TeamSettingsIteration;
  typeReport: TypeReport;
};
export function DataLayer({
  projectId,
  teamId,
  iteration,
  typeReport,
}: DataLayerProps) {
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

  return (
    <div>
      <TeamReport
        teamMembers={teamMembers}
        workItems={workItems}
        typeReport={typeReport}
      />
      <br />
      <br />
      <UserStoryReport workItems={workItems} typeReport={typeReport} />
    </div>
  );
}
