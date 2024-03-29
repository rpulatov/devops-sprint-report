import React from "react"

import { Card } from "azure-devops-ui/Card"
import { Pill, PillSize, PillVariant } from "azure-devops-ui/Pill"
import format from "date-fns/format"

import { getDatesIntervalString } from "../../../../utils"
import { TeamMemberWithInterval } from "../UserReportContainer/hooks/useUserReport"
import "./UserReportContent.css"

const MAX_LENGTH_NAME = 11

type UserReportContentProps = {
  teamMembers?: TeamMemberWithInterval[]
  projectColors: {
    [projectId: string]: {
      red: number
      green: number
      blue: number
    }
  }
}
export function UserReportContent({
  teamMembers = [],
  projectColors,
}: UserReportContentProps) {
  const widthContainer =
    teamMembers.length > 0
      ? (teamMembers[0].intervals.length + 1) * 140 + 40
      : "auto"
  return (
    <div
      className="user-report-content_container"
      style={{ width: widthContainer }}
    >
      {teamMembers.length > 0 ? (
        <div className="user-report-content_header">
          <div className="user-report-content_col"></div>
          {teamMembers[0].intervals.map(interval => (
            <div
              className="user-report-content_col"
              key={format(interval.startDate, "ddMMyyyy")}
            >
              {getDatesIntervalString(interval.startDate, interval.endDate)}
            </div>
          ))}
        </div>
      ) : null}
      {teamMembers.map(teamMember => (
        <Card
          className="user-report-content_row"
          key={teamMember.teamMember.id}
        >
          <div className="user-report-content_col">
            {teamMember.teamMember.name}
          </div>
          {teamMember.intervals.map(interval => {
            const summary = interval.projects.reduce(
              (acc, cur) => {
                acc.capacity += cur.capacity
                acc.completedWork += cur.completedWork
                return acc
              },
              { capacity: 0, completedWork: 0 }
            )
            return (
              <div
                className="user-report-content_col"
                key={format(interval.startDate, "ddMMyyyy")}
              >
                <div className="user-report-content_col-items">
                  {interval.projects.map(
                    ({ project, capacity, completedWork }) => (
                      <Pill
                        color={projectColors[project.id]}
                        size={PillSize.large}
                        variant={PillVariant.colored}
                        className="user-report-content_project"
                        key={project.id}
                      >
                        {project.name.length > MAX_LENGTH_NAME + 1 ? (
                          <span title={project.name}>
                            {`${project.name
                              .substring(0, MAX_LENGTH_NAME)
                              .trim()}.. `}
                          </span>
                        ) : (
                          `${project.name} `
                        )}
                        - {capacity > 0 ? capacity.toFixed(1) : 0} |{" "}
                        {completedWork > 0 ? completedWork.toFixed(1) : 0}
                      </Pill>
                    )
                  )}
                </div>
                <Pill
                  size={PillSize.large}
                  variant={PillVariant.standard}
                  className="user-report-content_project"
                >
                  Всего: {summary.capacity.toFixed(1)} |{" "}
                  {summary.completedWork.toFixed(1)}
                </Pill>
              </div>
            )
          })}
        </Card>
      ))}
    </div>
  )
}
