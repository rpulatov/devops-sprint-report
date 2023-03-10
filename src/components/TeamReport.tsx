import { TeamMemberCapacity } from 'azure-devops-extension-api/Work';
import { useMemo } from 'react';
import { WorkItemState } from '../domains/workItems';
import { diffInDays } from '../utils';

type TeamReportProps = {
  teamMembers: TeamMemberCapacity[];
  iterationDays: number;
  workItems: WorkItemState[];
};

export function TeamReport({
  teamMembers,
  iterationDays,
  workItems,
}: TeamReportProps) {
  const teamCapacity = useMemo(() => {
    return teamMembers.map((item) => {
      const daysOff = item.daysOff.reduce(
        (acc, value) => acc + (diffInDays(value.start, value.end) ?? 0),
        0
      );

      const allCapacityPerDay = item.activities.reduce(
        (acc, value) => acc + value.capacityPerDay,
        0
      );

      return {
        id: item.teamMember.id,
        name: item.teamMember.displayName,
        capacity: (iterationDays - daysOff) * allCapacityPerDay,
        workDays: iterationDays - daysOff,
      };
    });
  }, [teamMembers, iterationDays]);

  const teamReport = useMemo(() => {
    type TeamReportRow = {
      id: string;
      name: string;
      capacity: number;
      planEstimate: number;
      planComplete: number;
      planRemaining: number;
      overplanEstimate: number;
      overplanComplete: number;
      overplanRemaining: number;
    };

    const teamReportObj = teamCapacity.reduce(
      (acc: { [key: string]: TeamReportRow }, item) => {
        if (item.capacity > 0)
          acc[item.id] = {
            ...item,
            planEstimate: 0,
            planComplete: 0,
            planRemaining: 0,
            overplanEstimate: 0,
            overplanComplete: 0,
            overplanRemaining: 0,
          };
        return acc;
      },
      {}
    );

    for (const item of workItems) {
      const linkToTeamReportRow = teamReportObj[item?.assignedTo?.id];
      if (!linkToTeamReportRow) continue;
      if (item.overplan) {
        linkToTeamReportRow.overplanEstimate += item.originalEstimate;
        linkToTeamReportRow.overplanRemaining += item.remainingWork;
        linkToTeamReportRow.overplanComplete += item.completedWork;
      } else {
        linkToTeamReportRow.planEstimate += item.originalEstimate;
        linkToTeamReportRow.planRemaining += item.remainingWork;
        linkToTeamReportRow.planComplete += item.completedWork;
      }
    }

    return Object.values(teamReportObj);
  }, [workItems, teamCapacity]);

  return (
    <table>
      <thead>
        <tr>
          <th>ФИО</th>
          <th>Возможная загрузка, часы</th>

          <th>Плановая загрузка, часы</th>
          <th>Фактическая выработка по плановым задачам, часы</th>
          <th>Оставшаяся работа по плановым задачам, часы</th>

          <th>Фактическая выработка по добавленным задачам, часы</th>
          <th>Добавленная загрузка (по новым задачам), часы</th>
          <th>Оставшаяяся работа по добавленным задачам, часы</th>

          <th>Процент плановой загрузки на спринт</th>
          <th>Отклонения в оценке задач</th>
          <th>Отклонения в выработке</th>
        </tr>
      </thead>
      <tbody>
        {teamReport.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.capacity}</td>

            <td>{item.planEstimate}</td>
            <td>{item.planComplete}</td>
            <td>{item.planRemaining}</td>

            <td>{item.overplanComplete}</td>
            <td>{item.overplanEstimate}</td>
            <td>{item.overplanRemaining}</td>

            <td>
              {item.capacity > 0
                ? `${((item.planEstimate * 100) / item.capacity).toFixed(0)}%`
                : '-'}
            </td>
            <td>
              {item.planEstimate > 0
                ? (
                    ((item.planComplete + item.planRemaining) * 100) /
                      item.planEstimate -
                    100
                  ).toFixed(0) + '%'
                : '-'}
            </td>
            <td>
              {' '}
              {item.planEstimate > 0
                ? (
                    ((item.planComplete + item.overplanComplete) * 100) /
                      item.planEstimate -
                    100
                  ).toFixed(0) + '%'
                : '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
