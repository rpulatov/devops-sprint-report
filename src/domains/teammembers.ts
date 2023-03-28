import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';
import {
  diffInDays,
  getDatesArray,
  getNameOfDay,
  isDayInRange,
} from '../utils';
import {
  getCapacity,
  GetCapacityParams,
  getTeamDaysOff,
  getTeamSettings,
} from './teamsettings';

export type TeamMember = {
  id: string;
  name: string;
  capacity: number;
  workDays: number;
};

export type GetTeamMembersParams = {
  iteration: TeamSettingsIteration;
  projectId: string;
  teamId: string;
};
export async function getTeamMembers({
  iteration,
  projectId,
  teamId,
}: GetTeamMembersParams) {
  const data = await Promise.all([
    getCapacity({ projectId, teamId, iterationId: iteration.id }),
    getTeamDaysOff({ projectId, teamId, iterationId: iteration.id }),
    getTeamSettings({ projectId }),
  ]);

  const [capacity, teamDaysOff, teamWorkingDays] = data;

  const iterationDays = getDatesArray(
    new Date(iteration.attributes.startDate),
    new Date(iteration.attributes.finishDate)
  );

  const workDays = iterationDays.reduce((workDaysAcc, iterationDay) => {
    if (isDayInRange(teamDaysOff.daysOff, iterationDay)) return workDaysAcc;

    if (!teamWorkingDays.includes(iterationDay.getDay())) return workDaysAcc;

    workDaysAcc.push(iterationDay);
    return workDaysAcc;
  }, new Array<Date>());

  const teamMembers = capacity.map((item) => {
    let workDaysCount = workDays.length;
    if (item.daysOff.length > 0) {
      workDaysCount = workDays.reduce(
        (count, workDay) =>
          isDayInRange(item.daysOff, workDay) ? count : count + 1,
        0
      );
    }

    const allCapacityPerDay = item.activities.reduce(
      (acc, value) => acc + value.capacityPerDay,
      0
    );

    return {
      id: item.teamMember.id,
      name: item.teamMember.displayName,
      capacity: workDaysCount * allCapacityPerDay,
      workDays: workDaysCount,
    };
  });

  return teamMembers;
}
