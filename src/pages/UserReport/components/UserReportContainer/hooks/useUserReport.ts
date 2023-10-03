import React from "react"

import { TeamSettingsIteration } from "azure-devops-extension-api/Work"
import addMonths from "date-fns/addMonths"
import eachDayOfInterval from "date-fns/eachDayOfInterval"
import eachMonthOfInterval from "date-fns/eachMonthOfInterval"
import eachWeekOfInterval from "date-fns/eachWeekOfInterval"
import endOfDay from "date-fns/endOfDay"
import endOfMonth from "date-fns/endOfMonth"
import endOfWeek from "date-fns/endOfWeek"
import format from "date-fns/format"
import isWithinInterval from "date-fns/isWithinInterval"
import { da, te } from "date-fns/locale"
import startOfDay from "date-fns/startOfDay"
import mergeWith from "lodash/mergeWith"

import { getIterationCapacities } from "../../../../../domains/iterations"
import { getTeamMembers } from "../../../../../domains/teammembers"
import {
  getShortDataFromWorkItem,
  getWorkItemsByIteration,
} from "../../../../../domains/workItems"
import { IntervalOfWork } from "../../../../../types/report"

export type DateInterval = {
  startDate: Date
  endDate: Date
}

export interface IterationAcrossProjects extends TeamSettingsIteration {
  project: {
    id: string
    name: string
  }
}

export type WorkDayProject = {
  project: {
    id: string
    name: string
  }
  capacity: number
  completedWork: number
}

export type TeamMemberWorkDay = {
  date: Date
  projects: {
    [projectId: string]: WorkDayProject
  }
}

export type TeamMemberWorkDays = {
  [workDayText: string]: TeamMemberWorkDay
}

export type TeamMemberWithWorkDays = {
  teamMember: {
    id: string
    name: string
  }
  workDays: TeamMemberWorkDays
}

export type TeamMembersWithWorkDays = {
  [teamMemberId: string]: TeamMemberWithWorkDays
}

export type TeamMemberWithInterval = {
  teamMember: { id: string; name: string }
  intervals: { projects: WorkDayProject[]; startDate: Date; endDate: Date }[]
}

function getDateId(date: Date) {
  return format(date, "ddMMyyyy")
}

export function useUserReport() {
  const generateWorkIntervals = React.useCallback(
    (intervalOfWork: IntervalOfWork, dateRange: DateInterval) => {
      if (intervalOfWork === IntervalOfWork.Month) {
        return eachMonthOfInterval({
          start: dateRange.startDate,
          end: dateRange.endDate,
        }).map(firstDayOfMonth => ({
          startDate:
            firstDayOfMonth < dateRange.startDate
              ? dateRange.startDate
              : firstDayOfMonth,
          endDate:
            endOfMonth(firstDayOfMonth) > dateRange.endDate
              ? dateRange.endDate
              : endOfMonth(firstDayOfMonth),
        }))
      }
      if (intervalOfWork === IntervalOfWork.Week) {
        return eachWeekOfInterval(
          {
            start: dateRange.startDate,
            end: dateRange.endDate,
          },
          { weekStartsOn: 1 }
        ).map(firstDayOfWeek => ({
          startDate:
            firstDayOfWeek < dateRange.startDate
              ? dateRange.startDate
              : firstDayOfWeek,
          endDate:
            endOfWeek(firstDayOfWeek, { weekStartsOn: 1 }) > dateRange.endDate
              ? dateRange.endDate
              : endOfWeek(firstDayOfWeek, { weekStartsOn: 1 }),
        }))
      }

      if (intervalOfWork === IntervalOfWork.Day) {
        return eachDayOfInterval({
          start: dateRange.startDate,
          end: dateRange.endDate,
        }).map(startOfDay => ({
          startDate: startOfDay,
          endDate: endOfDay(startOfDay),
        }))
      }
      return [] as DateInterval[]
    },
    []
  )

  // на входе: итерация проекта
  // на выходе: по каждому члену команды даты рабочих дней, в каждом рабочем дне capacity и completedWork по проекту
  const getUserReportByIteration = React.useCallback(
    async (iteration: IterationAcrossProjects) => {
      const { teams } = await getIterationCapacities({
        projectId: iteration.project.id,
        iterationId: iteration.id,
      })

      const teamMembers = await Promise.all(
        teams.map(({ teamId }) =>
          getTeamMembers({ iteration, projectId: iteration.project.id, teamId })
        )
      ).then(res => res.flat())

      const workItems = await Promise.all(
        teams.map(({ teamId }) =>
          getWorkItemsByIteration({
            projectId: iteration.project.id,
            iterationPath: iteration.path,
            teamId,
          })
        )
      ).then(res => res.flat().map(getShortDataFromWorkItem()))

      const workItemsAggregate = workItems.reduce<{
        [teamMemberId: string]: {
          completedWork: number
          originalEstimate: number
          remainingWork: number
        }
      }>((prev, cur) => {
        if (!cur.assignedTo) return prev
        if (!prev[cur.assignedTo.id]) {
          cur.completedWork
          prev[cur.assignedTo.id] = {
            completedWork: cur.completedWork,
            originalEstimate: cur.originalEstimate,
            remainingWork: cur.remainingWork,
          }
        } else {
          prev[cur.assignedTo.id].completedWork += cur.completedWork
          prev[cur.assignedTo.id].originalEstimate += cur.originalEstimate
          prev[cur.assignedTo.id].remainingWork += cur.remainingWork
        }
        return prev
      }, {})

      const teamMembersWithWorkDays =
        teamMembers.reduce<TeamMembersWithWorkDays>(
          (prevTeamMembers, teamMember) => {
            if (!teamMember.workDays.length) return prevTeamMembers

            const completedWorkPerDay =
              (workItemsAggregate[teamMember.id]?.completedWork ?? 0) /
              teamMember.workDays.length

            if (teamMember.capacityPerDay === 0 && completedWorkPerDay === 0)
              return prevTeamMembers

            const workDays = teamMember.workDays.reduce<TeamMemberWorkDays>(
              (prevWorkDays, day) => {
                prevWorkDays[getDateId(day)] = {
                  date: startOfDay(day),
                  projects: {
                    [iteration.project.id]: {
                      project: { ...iteration.project },
                      capacity: teamMember.capacityPerDay,
                      completedWork: completedWorkPerDay,
                    },
                  },
                }
                return prevWorkDays
              },
              {}
            )

            prevTeamMembers[teamMember.id] = {
              teamMember: {
                id: teamMember.id,
                name: teamMember.name,
              },
              workDays,
            }
            return prevTeamMembers
          },
          {}
        )

      return teamMembersWithWorkDays
    },
    []
  )

  // укладываем дневную работу членов команд в интервалы и суммируем показатели
  const joinTeamMembersWithIntervals = React.useCallback(
    (
      teamMembers: TeamMembersWithWorkDays,
      intervals: DateInterval[]
    ): TeamMemberWithInterval[] => {
      return Object.values(teamMembers).map(teamMember => {
        const workDaysOfTeamMember = Object.values(teamMember.workDays)

        return {
          teamMember: teamMember.teamMember,
          intervals: intervals.map(interval => {
            return {
              ...interval,
              projects: Object.values(
                workDaysOfTeamMember.reduce<{ [key: string]: WorkDayProject }>(
                  (prevProjects, workDay) => {
                    if (
                      !isWithinInterval(workDay.date, {
                        start: interval.startDate,
                        end: interval.endDate,
                      })
                    ) {
                      return prevProjects
                    }
                    return mergeWith(
                      prevProjects,
                      workDay.projects,
                      (
                        prevValue: WorkDayProject | undefined,
                        value: WorkDayProject
                      ) =>
                        !prevValue
                          ? value
                          : {
                              ...prevValue,
                              completedWork:
                                prevValue.completedWork + value.completedWork,
                              capacity: prevValue.capacity + value.capacity,
                            }
                    )
                  },
                  {}
                )
              ),
            }
          }),
        }
      })
    },
    []
  )

  return {
    generateWorkIntervals,
    getUserReportByIteration,
    joinTeamMembersWithIntervals,
  }
}
