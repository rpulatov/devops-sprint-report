import React from "react";
import { TeamMemberWithInterval } from "../UserReportContainer/hooks/useUserReport";

type UserReportContentProps = { teamMembers: TeamMemberWithInterval[] };
export function UserReportContent({ teamMembers }: UserReportContentProps) {
  return (
    <div>
      {teamMembers.map((member) => (
        <div>{member.teamMember.name}</div>
      ))}
    </div>
  );
}
