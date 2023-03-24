import { TeamMemberCapacity } from 'azure-devops-extension-api/Work';
import { useMemo, useCallback } from 'react';
import { WorkItemState } from '../domains/workItems';
import { TypeReport } from '../types/report';
import { diffInDays } from '../utils';

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

const calcPercentageLoad = (
  item: Pick<TeamReportRow, 'capacity' | 'planEstimate'>
) => {
  if (item.capacity <= 0) return '-';
  return `${((item.planEstimate * 100) / item.capacity).toFixed(0)}%`;
};

const calcEstimationAccuracy = (
  item: Pick<TeamReportRow, 'planEstimate' | 'planComplete' | 'planRemaining'>
) => {
  if (item.planEstimate <= 0) return '-';
  const accuracy =
    ((item.planComplete + item.planRemaining) * 100) / item.planEstimate - 100;

  return accuracy === 0
    ? `идеально`
    : accuracy > 0
    ? `на ${accuracy.toFixed(0)}% дольше`
    : `на ${-accuracy.toFixed(0)}% быстрее`;
};

const calcPercentageProductivity = (
  item: Pick<TeamReportRow, 'planComplete' | 'overplanComplete' | 'capacity'>
) => {
  if (item.capacity <= 0) return '-';
  const accuracy =
    ((item.planComplete + item.overplanComplete) * 100) / item.capacity - 100;

  return accuracy === 0
    ? `идеально`
    : accuracy > 0
    ? `переработка ${accuracy.toFixed(0)}%`
    : `недоработка ${-accuracy.toFixed(0)}%`;
};

type TeamReportProps = {
  teamMembers: TeamMemberCapacity[];
  iterationDays: number;
  workItems: WorkItemState[];
  typeReport: TypeReport;
};

export function TeamReport({
  teamMembers,
  iterationDays,
  workItems,
  typeReport,
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

  const total = useMemo(
    () =>
      teamReport.reduce(
        (acc, item) => {
          acc.capacity += item.capacity;
          acc.planEstimate += item.planEstimate;
          acc.planComplete += item.planComplete;
          acc.planRemaining += item.planRemaining;
          acc.overplanComplete += item.overplanComplete;
          acc.overplanEstimate += item.overplanEstimate;
          acc.overplanRemaining += item.overplanRemaining;
          return acc;
        },
        {
          capacity: 0,
          planEstimate: 0,
          planComplete: 0,
          planRemaining: 0,
          overplanComplete: 0,
          overplanEstimate: 0,
          overplanRemaining: 0,
          percentageLoad: 0,
          estimationAccuracy: 0,
          percentageProductivity: 0,
        }
      ),
    [teamReport]
  );

  return (
    <table>
      <thead>
        <tr>
          <th>ФИО</th>
          <th>Возможная загрузка, часы</th>

          <th>Плановая загрузка, часы</th>
          {typeReport === TypeReport.SprintResult ? (
            <>
              <th>Фактическая выработка по плановым задачам, часы</th>
              <th>Оставшаяся работа по плановым задачам, часы</th>

              <th>Фактическая выработка по добавленным задачам, часы</th>
              <th>Добавленная загрузка (по новым задачам), часы</th>
              <th>Оставшаяяся работа по добавленным задачам, часы</th>
            </>
          ) : null}
          <th>Процент плановой загрузки на спринт</th>
          {typeReport === TypeReport.SprintResult ? (
            <>
              <th>Отклонения в оценке задач</th>
              <th>Отклонения в выработке</th>
            </>
          ) : null}
        </tr>
      </thead>
      <tbody>
        {teamReport.map((item) => {
          return (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.capacity.toFixed(1)}</td>

              <td>{item.planEstimate.toFixed(1)}</td>
              {typeReport === TypeReport.SprintResult ? (
                <>
                  <td>{item.planComplete.toFixed(1)}</td>
                  <td>{item.planRemaining.toFixed(1)}</td>

                  <td>{item.overplanComplete.toFixed(1)}</td>
                  <td>{item.overplanEstimate.toFixed(1)}</td>
                  <td>{item.overplanRemaining.toFixed(1)}</td>
                </>
              ) : null}
              <td>{calcPercentageLoad(item)}</td>
              {typeReport === TypeReport.SprintResult ? (
                <>
                  <td>{calcEstimationAccuracy(item)}</td>
                  <td>{calcPercentageProductivity(item)}</td>
                </>
              ) : null}
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <td>ИТОГО:</td>
          <td>{total.capacity.toFixed(1)}</td>
          <td>{total.planEstimate.toFixed(1)}</td>
          {typeReport === TypeReport.SprintResult ? (
            <>
              <td>{total.planComplete.toFixed(1)}</td>
              <td>{total.planRemaining.toFixed(1)}</td>

              <td>{total.overplanComplete.toFixed(1)}</td>
              <td>{total.overplanEstimate.toFixed(1)}</td>
              <td>{total.overplanRemaining.toFixed(1)}</td>
            </>
          ) : null}
          <td>{calcPercentageLoad(total)}</td>
          {typeReport === TypeReport.SprintResult ? (
            <>
              <td>{calcEstimationAccuracy(total)}</td>
              <td>{calcPercentageProductivity(total)}</td>
            </>
          ) : null}
        </tr>
      </tfoot>
    </table>
  );
}
