import { useCallback } from 'react';
import XLSX from 'xlsx';
import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';
import { useTeamMembers } from '../hooks/useTeamMembers';

import { useWorkItems } from '../hooks/useWorkItems';
import { useUserStories } from '../hooks/useUserStories';
import { TypeReport } from '../types/report';

import { TeamReport } from './TeamReport';
import { UserStoryReport } from './UserStoryReport';
import { FeatureReport } from './FeatureReport';
import { tableToExcel } from './tables/excel';

type ContainerProps = {
  projectId: string;
  teamId: string;
  iteration: TeamSettingsIteration;
  typeReport: TypeReport;
};
export function Container({
  projectId,
  teamId,
  iteration,
  typeReport,
}: ContainerProps) {
  const { teamMembers } = useTeamMembers({
    iteration,
    projectId,
    teamId,
  });

  const { workItems } = useWorkItems({
    projectId,
    teamId,
    iterationPath: iteration.path,
  });

  const { userStories } = useUserStories({ workItems });

  const exportToExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.table_to_sheet(
      document.querySelector('#team-report')
    );
    XLSX.utils.book_append_sheet(wb, ws1, 'Отчет по команде');

    const ws2 = XLSX.utils.table_to_sheet(
      document.querySelector('#user-story-report')
    );
    XLSX.utils.book_append_sheet(wb, ws2, 'User Story');

    XLSX.writeFile(wb, 'sprint.xlsx');
  }, []);

  return (
    <div>
      <button onClick={exportToExcel}>Export to Excel</button>
      <TeamReport
        teamMembers={teamMembers}
        workItems={workItems}
        typeReport={typeReport}
        htmlIdElement="team-report"
      />
      <br />
      <br />
      <UserStoryReport
        userStories={userStories}
        typeReport={typeReport}
        htmlIdElement="user-story-report"
      />
      <br />
      <br />
      <FeatureReport
        userStories={userStories}
        typeReport={typeReport}
        htmlIdElement="feature-report"
      />
    </div>
  );
}
