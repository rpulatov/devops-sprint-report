import React from 'react';
import { errorNotification } from '../api/notificationObserver';
import {
  getTeamMembers,
  GetTeamMembersParams,
  TeamMember,
} from '../domains/teammembers';

export function useTeamMembers({
  iteration,
  projectId,
  teamId,
}: GetTeamMembersParams) {
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  React.useEffect(() => {
    setTeamMembers([]);
    getTeamMembers({ projectId, iteration, teamId })
      .then(setTeamMembers)
      .catch(errorNotification);
  }, [projectId, iteration, teamId]);
  return { teamMembers };
}
