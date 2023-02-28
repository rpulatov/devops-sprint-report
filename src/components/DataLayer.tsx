import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';
import { useCallback, useMemo } from 'react';
import { useCapacity } from '../domains/capacity';
import { diffInDays } from '../utils';

type DataLayerProps = {
  projectId: string;
  teamId: string;
  iteration: TeamSettingsIteration;
};
export function DataLayer({ projectId, teamId, iteration }: DataLayerProps) {
  const { teamMembers, teamDaysOff } = useCapacity({
    projectId,
    teamId,
    iterationId: iteration.id,
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

  const teamCapacity = useMemo(() => {
    return teamMembers.map((item) => {
      const daysOff = item.daysOff.reduce(
        (acc, value) => acc + (diffInDays(value.start, value.end) ?? 0),
        0
      );

      const allCapacityPerDay = item.activities.reduce(
        (acc, value) => acc + value.capacityPerDay,
        0
      );

      return {
        id: item.teamMember.id,
        name: item.teamMember.displayName,
        capacity: (iterationDays - daysOff) * allCapacityPerDay,
        workDays: iterationDays - daysOff,
      };
    });
  }, [teamMembers, iterationDays]);

  return (
    <div>
      {teamCapacity.map((member) => (
        <div key={member.id}>
          <div>{member.name}</div>
          <div>
            {member.workDays} dddd {member.capacity}
          </div>
        </div>
      ))}
    </div>
  );
}
