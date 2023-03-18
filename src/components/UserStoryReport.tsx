import { useMemo, useEffect, useState } from 'react';
import {
  getUserStoryReport,
  UserStoryReportItem,
} from '../domains/userStoryReport';
import { WorkItemState } from '../domains/workItems';
import { TypeReport } from '../types/report';

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
          acc.complete += item.complete;
          acc.overplanEstimate += item.overplanEstimate;
          acc.planEstimate += item.planEstimate;
          acc.remaining += item.remaining;
          acc.countClosed += item.isClosed ? 1 : 0;
          return acc;
        },
        {
          planEstimate: 0,
          complete: 0,
          overplanEstimate: 0,
          remaining: 0,
          countClosed: 0,
        }
      ),
    [items]
  );

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Цель спринта (User Story)</th>
            <th>Функционал (Feature)</th>
            {typeReport === TypeReport.SprintResult && <th>Статус</th>}
            <th>Ответственный</th>

            <th>Плановая загрузка, часы</th>
            {typeReport === TypeReport.SprintResult && (
              <th>Фактическая выработка, часы</th>
            )}
            {typeReport === TypeReport.SprintResult && (
              <th>Добавленная загрузка, часы</th>
            )}
            {typeReport === TypeReport.SprintResult && (
              <th>Оставшаяся работа, часы</th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className={
                typeReport === TypeReport.SprintPlan
                  ? ''
                  : item.isClosed
                  ? 'userStoryClosed'
                  : 'userStoryNotClosed'
              }
            >
              <td>{item.name}</td>
              <td>{item.parentName}</td>
              {typeReport === TypeReport.SprintResult && <td>{item.state}</td>}
              <td>{item.assignedToName}</td>

              <td>{item.planEstimate.toFixed(1)}</td>
              {typeReport === TypeReport.SprintResult && (
                <td>{item.complete.toFixed(1)}</td>
              )}
              {typeReport === TypeReport.SprintResult && (
                <td>{item.overplanEstimate.toFixed(1)}</td>
              )}
              {typeReport === TypeReport.SprintResult && (
                <td>{item.remaining.toFixed(1)}</td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Итого</td>
            <td></td>
            {typeReport === TypeReport.SprintResult && <td></td>}
            <td></td>

            <td>{total.planEstimate.toFixed(1)}</td>
            {typeReport === TypeReport.SprintResult && (
              <td>{total.complete.toFixed(1)}</td>
            )}
            {typeReport === TypeReport.SprintResult && (
              <td>{total.overplanEstimate.toFixed(1)}</td>
            )}
            {typeReport === TypeReport.SprintResult && (
              <td>{total.remaining.toFixed(1)}</td>
            )}
          </tr>
        </tfoot>
      </table>
      {typeReport === TypeReport.SprintResult && (
        <table>
          <tbody>
            <tr>
              <td className="userStoryClosed">Выполнено из плановых</td>
              <td className="userStoryClosed">{total.countClosed}</td>
            </tr>
            <tr>
              <td className="userStoryNotClosed">Невыполнено из плановых</td>
              <td className="userStoryNotClosed">
                {items.length - total.countClosed}
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
