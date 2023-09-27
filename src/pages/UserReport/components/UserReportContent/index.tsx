import React from "react";
import { TeamMemberWithInterval } from "../UserReportContainer/hooks/useUserReport";

import format from "date-fns/format";
import { Card } from "azure-devops-ui/Card";
import { Pill, PillSize, PillVariant } from "azure-devops-ui/Pill";

import "./UserReportContent.css";

type UserReportContentProps = { teamMembers?: TeamMemberWithInterval[] };
export function UserReportContent({
  teamMembers = [],
}: UserReportContentProps) {
  return (
    <div className="user-report-content_container">
      {teamMembers.length > 0 ? (
        <div className="user-report-content_header">
          <div className="user-report-content_col"></div>
          {teamMembers[0].intervals.map((interval) => (
            <div
              className="user-report-content_col"
              key={format(interval.startDate, "ddMMyyyy")}
            >
              {format(interval.startDate, "dd.MM.yyyy")} -{" "}
              {format(interval.endDate, "dd.MM.yyyy")}
            </div>
          ))}
        </div>
      ) : null}
      {teamMembers.map((teamMember) => (
        <Card
          className="user-report-content_row"
          key={teamMember.teamMember.id}
        >
          <div className="user-report-content_col">
            {teamMember.teamMember.name}
          </div>
          {teamMember.intervals.map((interval) => (
            <div
              className="user-report-content_col"
              key={format(interval.startDate, "ddMMyyyy")}
            >
              {interval.projects.map(({ project, capacity, completedWork }) => (
                <Pill
                  color={{ red: 151, green: 30, blue: 79 }}
                  size={PillSize.large}
                  variant={PillVariant.colored}
                  className="user-report-content_project"
                  key={project.id}
                >
                  {project.name} - {capacity}/{completedWork}
                </Pill>
              ))}
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
}
