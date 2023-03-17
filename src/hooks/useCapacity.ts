import React from 'react';

import { DateRange, TeamMemberCapacity } from 'azure-devops-extension-api/Work';
import { errorNotification } from '../api/notificationObserver';
import {
  getCapacity,
  GetCapacityParams,
  getTeamDaysOff,
} from '../domains/capacity';

export function useCapacity({
  projectId,
  teamId,
  iterationId,
}: GetCapacityParams) {
  const [teamMembers, setTeamMembers] = React.useState<TeamMemberCapacity[]>(
    []
  );
  const [teamDaysOff, setTeamDaysOff] = React.useState<DateRange[]>([]);

  React.useEffect(() => {
    setTeamMembers([]);
    setTeamDaysOff([]);
    getCapacity({ projectId, teamId, iterationId })
      .then((res) => setTeamMembers(res))
      .catch(errorNotification);

    getTeamDaysOff({ projectId, teamId, iterationId })
      .then((res) => setTeamDaysOff(res.daysOff))
      .catch(errorNotification);
  }, [projectId, teamId, iterationId]);

  return {
    teamMembers,
    teamDaysOff,
  };
}
