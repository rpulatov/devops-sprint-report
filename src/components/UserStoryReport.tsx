import { useMemo, useEffect, useState } from 'react';
import {
  getUserStoryReport,
  UserStoryReportItem,
} from '../domains/userStoryReport';
import { WorkItemState } from '../domains/workItems';
import { TypeReport } from '../types/report';
import { Table } from './tables/Table';
import { TableColumn } from './tables/TableColumn';

type UserStoryReportProps = {
  workItems: WorkItemState[];
  typeReport: TypeReport;
};
export function UserStoryReport({
  workItems,
  typeReport,
}: UserStoryReportProps) {
  const [items, setItems] = useState<UserStoryReportItem[]>([]);

  useEffect(() => {
    setItems([]);
    getUserStoryReport({ workItems }).then(setItems);
  }, [workItems]);

  const total = useMemo(
    () =>
      items.reduce(
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
    [items]
  );

  return (
    <>
      <Table data={items}>
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
              <td>{items.length - total.countClosed}</td>
            </tr>
            <tr>
              <td>Процент выполнения (по количеству User Story)</td>
              <td>
                {items.length > 0
                  ? `${((total.countClosed * 100) / items.length).toFixed(1)}%`
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
          </tbody>
        </table>
      )}
    </>
  );
}

// user story
// -- наименование
// -- название фичи
// -- статус
// -- ответственный
// -- Плановая загрузка, часы
// -- Фактическая выработка, часы
// -- Добавленная загрузка, часы
// -- Оставшаяся работа, часы