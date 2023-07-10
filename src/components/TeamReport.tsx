import { TeamMember } from '../domains/teammembers';
import { WorkItemState } from '../domains/workItems';
import { TeamReportRow, useTeamReport } from '../hooks/useTeamReport';
import { TypeReport } from '../types/report';
import { Table } from './tables/Table';
import { TableColumn } from './tables/TableColumn';

const calcPercentageLoad = (
  item: Pick<TeamReportRow, 'capacity' | 'planEstimate'>
) => {
  if (item.capacity <= 0) return '-';
  const accuracy = (item.planEstimate * 100) / item.capacity - 100;

  return accuracy === 0
    ? `идеально`
    : accuracy > 0
    ? `перегружен на ${accuracy.toFixed(0)}%`
    : `недогружен на ${-accuracy.toFixed(0)}%`;
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
  teamMembers: TeamMember[];
  workItems: WorkItemState[];
  typeReport: TypeReport;
  htmlIdElement: string;
};

export function TeamReport({
  teamMembers,
  workItems,
  typeReport,
  htmlIdElement,
}: TeamReportProps) {
  const { teamReport, total } = useTeamReport({ workItems, teamMembers });

  return (
    <Table data={teamReport} htmlIdElement={htmlIdElement}>
      <TableColumn
        name="name"
        title="ФИО"
        className="noWrapColumn"
        renderFooter={() => 'ИТОГО:'}
      />
      <TableColumn
        name="capacity"
        title="Возможные часы"
        type="number"
        className="column-centered"
        renderFooter={() => total.capacity.toFixed(1)}
      />
      <TableColumn
        name="planEstimate"
        title="Плановые часы"
        type="number"
        className="column-centered"
        renderFooter={() => total.planEstimate.toFixed(1)}
      />
      {typeReport === TypeReport.SprintResult ? (
        <>
          <TableColumn
            name="planComplete"
            title="Фактические часы"
            type="number"
            className="column-centered"
            renderFooter={() => total.planComplete.toFixed(1)}
          />
          <TableColumn
            name="planRemaining"
            title="Оставшиеся часы"
            type="number"
            className="column-centered"
            renderFooter={() => total.planRemaining.toFixed(1)}
          />
          <TableColumn
            name="overplanEstimate"
            title="Добавленные задачи"
            type="number"
            className="column-centered"
            renderFooter={() => total.overplanEstimate.toFixed(1)}
          />
          <TableColumn
            name="overplanComplete"
            title="Фактические часы по добавленным задачам"
            type="number"
            className="column-centered"
            renderFooter={() => total.overplanComplete.toFixed(1)}
          />

          <TableColumn
            name="overplanRemaining"
            title="Оставшиеся часы по добавленным задачам"
            type="number"
            className="column-centered"
            renderFooter={() => total.overplanRemaining.toFixed(1)}
          />
          <TableColumn
            title="Итоговая фактическая загрузка"
            type="number"
            className="column-centered"
            render={(item: TeamReportRow) =>
              (item.planComplete + item.overplanComplete).toFixed(1)
            }
            renderFooter={() =>
              (total.planComplete + total.overplanComplete).toFixed(1)
            }
          />
          <TableColumn
            title="Доля внеплановых задач"
            type="number"
            className="column-centered"
            render={(item: TeamReportRow) =>
              item.planComplete + item.overplanComplete > 0
                ? (
                    (item.overplanComplete * 100) /
                    (item.planComplete + item.overplanComplete)
                  ).toFixed(1) + '%'
                : '-'
            }
            renderFooter={() =>
              total.planComplete + total.overplanComplete > 0
                ? (
                    (total.overplanComplete * 100) /
                    (total.planComplete + total.overplanComplete)
                  ).toFixed(1) + '%'
                : '-'
            }
          />
        </>
      ) : null}

      <TableColumn
        title="Плановая загрузка на спринт"
        className="noWrapColumn"
        render={calcPercentageLoad}
        renderFooter={() => calcPercentageLoad(total)}
      />

      {typeReport === TypeReport.SprintResult ? (
        <>
          <TableColumn
            title="Отклонения в оценке задач"
            className="noWrapColumn"
            render={calcEstimationAccuracy}
            renderFooter={() => calcEstimationAccuracy(total)}
          />
          <TableColumn
            title="Отклонения в выработке"
            className="noWrapColumn"
            render={calcPercentageProductivity}
            renderFooter={() => calcPercentageProductivity(total)}
          />
        </>
      ) : null}
    </Table>
  );
}
