import { fetchAzure } from '../api';
import {
  TeamMemberCapacity,
  TeamSettingsDaysOff,
} from 'azure-devops-extension-api/Work';

export type GetCapacityParams = {
  projectId: string;
  teamId: string;
  iterationId: string;
};
export async function getCapacity({
  projectId,
  teamId,
  iterationId,
}: GetCapacityParams) {
  return fetchAzure(`/work/teamsettings/iterations/${iterationId}/capacities`, {
    projectId,
    teamId,
  }).then((res: { teamMembers: TeamMemberCapacity[] }) => res.teamMembers);
}

export async function getTeamDaysOff({
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
