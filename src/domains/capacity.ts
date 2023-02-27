import React from 'react';
import { fetchAzure } from '../api';
import { TeamMemberCapacity } from 'azure-devops-extension-api/Work';

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

export function useCapacity({
  projectId,
  teamId,
  iterationId,
}: GetCapacityParams) {
  const [teamMembers, setTeamMembers] = React.useState<TeamMemberCapacity[]>(
    []
  );
  React.useEffect(() => {
    getCapacity({ projectId, teamId, iterationId }).then((res) =>
      setTeamMembers(res)
    );
  }, [projectId]);
  return {
    teamMembers,
  };
}
