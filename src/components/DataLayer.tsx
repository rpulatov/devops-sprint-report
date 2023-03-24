import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';
import { useCallback, useMemo } from 'react';
import { useCapacity } from '../hooks/useCapacity';
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
  const { teamMembers, teamDaysOff } = useCapacity({
    projectId,
    teamId,
    iterationId: iteration.id,
  });

  const { workItems } = useWorkItems({
    projectId,
    teamId,
    iterationPath: iteration.path,
  });

  const iterationDays = useMemo(() => {
    const countTeamDaysOff = teamDaysOff.reduce(
      (acc, value) => acc + (diffInDays(value.start, value.end) ?? 0),
      0
    );

    const countIterationDays =
      diffInDays(
        iteration.attributes.finishDate,
        iteration.attributes.startDate
      ) ?? 0;

    return countIterationDays - countTeamDaysOff;
  }, [iteration, teamDaysOff]);

  return (
    <div>
      <TeamReport
        teamMembers={teamMembers}
        iterationDays={iterationDays}
        workItems={workItems}
        typeReport={typeReport}
      />
      <br />
      <br />
      <UserStoryReport workItems={workItems} typeReport={typeReport} />
    </div>
  );
}
