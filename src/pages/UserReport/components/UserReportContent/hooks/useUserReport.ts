import React from "react";
import { IntervalOfWork } from "../../../../../types/report";
import eachMonthOfInterval from "date-fns/eachMonthOfInterval";
import { da, te } from "date-fns/locale";
import addMonths from "date-fns/addMonths";
import endOfMonth from "date-fns/endOfMonth";
import eachWeekOfInterval from "date-fns/eachWeekOfInterval";
import endOfWeek from "date-fns/endOfWeek";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import endOfDay from "date-fns/endOfDay";
import { getIterationCapacities } from "../../../../../domains/iterations";
import { TeamSettingsIteration } from "azure-devops-extension-api/Work";
import { getTeamMembers } from "../../../../../domains/teammembers";
import format from "date-fns/format";
import startOfDay from "date-fns/startOfDay";

export type DateInterval = {
  startDate: Date;
  endDate: Date;
};

export interface IterationAcrossProjects extends TeamSettingsIteration {
  project: {
    id: string;
    name: string;
  };
}

export type TeamMemberWorkDay = {
  date: Date;
  projects: {
    [projectId: string]: {
      project: {
        id: string;
        name: string;
      };
      capacity: number;
      completedWork: number;
    };
  };
};

export type TeamMemberWorkDays = {
  [workDayText: string]: TeamMemberWorkDay;
};

export type TeamMemberWithWorkDays = {
  teamMember: {
    id: string;
    name: string;
  };
  workDays: TeamMemberWorkDays;
};

export type TeamMembersWithWorkDays = {
  [teamMemberId: string]: TeamMemberWithWorkDays;
};

function getDateId(date: Date) {
  return format(date, "ddMMyyyy");
}

export function useUserReport() {
  const generateWorkIntervals = React.useCallback(
    (intervalOfWork: IntervalOfWork, dateRange: DateInterval) => {
      if (intervalOfWork === IntervalOfWork.Month) {
        return eachMonthOfInterval({
          start: dateRange.startDate,
          end: dateRange.endDate,
        }).map((firstDayOfMonth) => ({
          startDate:
            firstDayOfMonth < dateRange.startDate
              ? dateRange.startDate
              : firstDayOfMonth,
          endDate:
            endOfMonth(firstDayOfMonth) > dateRange.endDate
              ? dateRange.endDate
              : endOfMonth(firstDayOfMonth),
        }));
      }
      if (intervalOfWork === IntervalOfWork.Week) {
        return eachWeekOfInterval(
          {
            start: dateRange.startDate,
            end: dateRange.endDate,
          },
          { weekStartsOn: 1 }
        ).map((firstDayOfWeek) => ({
          startDate:
            firstDayOfWeek < dateRange.startDate
              ? dateRange.startDate
              : firstDayOfWeek,
          endDate:
            endOfWeek(firstDayOfWeek, { weekStartsOn: 1 }) > dateRange.endDate
              ? dateRange.endDate
              : endOfWeek(firstDayOfWeek, { weekStartsOn: 1 }),
        }));
      }

      if (intervalOfWork === IntervalOfWork.Day) {
        return eachDayOfInterval({
          start: dateRange.startDate,
          end: dateRange.endDate,
        }).map((startOfDay) => ({
          startDate: startOfDay,
          endDate: endOfDay(startOfDay),
        }));
      }
      return [] as DateInterval[];
    },
    []
  );

  // на входе: итерация проекта
  // на выходе: по каждому члену команды даты рабочих дней, в каждом рабочем дне capacity и completedWork по проекту
  const getUserReportByIteration = React.useCallback(
    async (iteration: IterationAcrossProjects) => {
      const { teams } = await getIterationCapacities({
        projectId: iteration.project.id,
        iterationId: iteration.id,
      });

      const teamMembers = await Promise.all(
        teams.map(({ teamId }) =>
          getTeamMembers({ iteration, projectId: iteration.project.id, teamId })
        )
      ).then((res) => res.flat());

      const teamMembersWithWorkDays =
        teamMembers.reduce<TeamMembersWithWorkDays>(
          (prevTeamMembers, teamMember) => {
            if (teamMember.capacityPerDay === 0) return prevTeamMembers;

            const workDays = teamMember.workDays.reduce<TeamMemberWorkDays>(
              (prevWorkDays, day) => {
                prevWorkDays[getDateId(day)] = {
                  date: startOfDay(day),
                  projects: {
                    [iteration.project.id]: {
                      project: { ...iteration.project },
                      capacity: teamMember.capacityPerDay,
                      completedWork: 0, //TODO
                    },
                  },
                };
                return prevWorkDays;
              },
              {}
            );

            prevTeamMembers[teamMember.id] = {
              teamMember: {
                id: teamMember.id,
                name: teamMember.name,
              },
              workDays,
            };
            return prevTeamMembers;
          },
          {}
        );

      return teamMembersWithWorkDays;
    },
    []
  );

  return { generateWorkIntervals, getUserReportByIteration };
}
