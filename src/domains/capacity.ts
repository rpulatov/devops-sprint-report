import React from 'react';
import { fetchAzure } from '../api';
import {
  DateRange,
  TeamMemberCapacity,
  TeamSettingsDaysOff,
} from 'azure-devops-extension-api/Work';

type GetCapacityParams = {
  projectId: string;
  teamId: string;
  iterationId: string;
};
async function getCapacity({
  projectId,
  teamId,
  iterationId,
}: GetCapacityParams) {
  return fetchAzure(`/work/teamsettings/iterations/${iterationId}/capacities`, {
    projectId,
    teamId,
  }).then((res: { teamMembers: TeamMemberCapacity[] }) => res.teamMembers);
}

async function getTeamDaysOff({
  projectId,
  teamId,
  iterationId,
}: GetCapacityParams) {
  return fetchAzure(
    `/work/teamsettings/iterations/${iterationId}/teamdaysoff`,
    {
      projectId,
      teamId,
    }
  ).then((res: TeamSettingsDaysOff) => res);
}

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
    getCapacity({ projectId, teamId, iterationId }).then((res) =>
      setTeamMembers(res)
    );

    getTeamDaysOff({ projectId, teamId, iterationId }).then((res) =>
      setTeamDaysOff(res.daysOff)
    );
  }, [projectId]);

  return {
    teamMembers,
    teamDaysOff,
  };
}
