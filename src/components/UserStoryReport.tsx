import { useMemo } from 'react';
import { UserStoryReportItem } from '../domains/userStoryReport';
import { TypeReport } from '../types/report';
import { Table } from './tables/Table';
import { TableColumn } from './tables/TableColumn';

type UserStoryReportProps = {
  userStories: UserStoryReportItem[];
  typeReport: TypeReport;
  htmlIdElement: string;
};
export function UserStoryReport({
  userStories,
  typeReport,
  htmlIdElement,
}: UserStoryReportProps) {
  const total = useMemo(
    () =>
      userStories.reduce(
        (acc, item) => {
          acc.planComplete += item.planComplete;
          acc.overplanComplete += item.overplanComplete;
          acc.overplanEstimate += item.overplanEstimate;
          acc.planEstimate += item.planEstimate;
          acc.planRemaining += item.planRemaining;
          acc.overplanRemaining += item.overplanRemaining;
          acc.countClosed += item.isClosed ? 1 : 0;

          return acc;
        },
        {
          planEstimate: 0,
          planComplete: 0,
          planRemaining: 0,
          overplanEstimate: 0,
          overplanComplete: 0,
          overplanRemaining: 0,
          countClosed: 0,
        }
      ),
    [userStories]
  );

  return (
    <>
      <Table data={userStories} htmlIdElement={htmlIdElement}>
        <TableColumn
          name="name"
          title="Цель спринта (User Story)"
          renderFooter={() => 'ИТОГО:'}
        />
        <TableColumn name="parentName" title="Функционал (Feature)" />

        {typeReport === TypeReport.SprintResult ? (
          <TableColumn name="state" title="Статус" />
        ) : null}
        <TableColumn
          name="assignedToName"
          title="Ответственный"
          className="noWrapColumn"
        />
        <TableColumn
          name="planEstimate"
          title="Плановые часы"
          type="number"
          className="column-centered"
          renderFooter={() => total.planEstimate.toFixed(1)}
        />
        {typeReport === TypeReport.SprintResult ? (
          <TableColumn
            name="planComplete"
            title="Фактические часы"
            type="number"
            className="column-centered"
            renderFooter={() => total.planComplete.toFixed(1)}
          />
        ) : null}
        {typeReport === TypeReport.SprintResult ? (
          <TableColumn
            name="planRemaining"
            title="Оставшиеся часы"
            type="number"
            className="column-centered"
            renderFooter={() => total.planRemaining.toFixed(1)}
          />
        ) : null}
        {typeReport === TypeReport.SprintResult ? (
          <TableColumn
            name="overplanEstimate"
            title="Добавленные задачи"
            type="number"
            className="column-centered"
            renderFooter={() => total.overplanEstimate.toFixed(1)}
          />
        ) : null}

        {typeReport === TypeReport.SprintResult ? (
          <TableColumn
            name="overplanComplete"
            title="Фактические часы по добавленным задачам"
            type="number"
            className="column-centered"
            renderFooter={() => total.overplanComplete.toFixed(1)}
          />
        ) : null}

        {typeReport === TypeReport.SprintResult ? (
          <TableColumn
            name="overplanRemaining"
            title="Оставшиеся часы по добавленным задачам"
            type="number"
            className="column-centered"
            renderFooter={() => total.overplanRemaining.toFixed(1)}
          />
        ) : null}
      </Table>
      {typeReport === TypeReport.SprintResult && (
        <table>
          <tbody>
            <tr>
              <td>Выполнено из плановых</td>
              <td>{total.countClosed}</td>
            </tr>
            <tr>
              <td>Невыполнено из плановых</td>
              <td>{userStories.length - total.countClosed}</td>
            </tr>
            <tr>
              <td>Процент выполнения (по количеству User Story)</td>
              <td>
                {userStories.length > 0
                  ? `${((total.countClosed * 100) / userStories.length).toFixed(
                      1
                    )}%`
                  : '-'}
              </td>
            </tr>
            <tr>
              <td>
                Процент выполнения плановых задач спринта (по количеству часов)
              </td>
              <td>
                {total.planEstimate > 0
                  ? `${(
                      (1 - total.planRemaining / total.planEstimate) *
                      100
                    ).toFixed(1)}%`
                  : '-'}
              </td>
            </tr>
            <tr>
              <td>
                Процент выполнения внеплановых задач спринта (по количеству
                часов)
              </td>
              <td>
                {total.overplanEstimate > 0
                  ? `${(
                      (1 - total.overplanRemaining / total.overplanEstimate) *
                      100
                    ).toFixed(1)}%`
                  : '-'}
              </td>
            </tr>
            <tr>
              <td>Доля внеплановых задач (по количеству часов)</td>
              <td>
                {total.overplanComplete > 0
                  ? `${(
                      (total.overplanComplete * 100) /
                      (total.planComplete + total.overplanComplete)
                    ).toFixed(1)}%`
                  : '-'}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </>
  );
}
