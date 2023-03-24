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
          acc.planRemaining += item.planRemaining;
          acc.overplanRemaining += item.overplanRemaining;
          acc.countClosed += item.isClosed ? 1 : 0;
          return acc;
        },
        {
          planEstimate: 0,
          complete: 0,
          overplanEstimate: 0,
          planRemaining: 0,
          overplanRemaining: 0,
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
              <th>Оставшаяся работа по плановым, часы</th>
            )}
            {typeReport === TypeReport.SprintResult && (
              <th>Оставшаяся работа по внеплановым, часы</th>
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
              <td className="noWrapColumn">{item.assignedToName}</td>

              <td>{item.planEstimate.toFixed(1)}</td>
              {typeReport === TypeReport.SprintResult && (
                <td>{item.complete.toFixed(1)}</td>
              )}
              {typeReport === TypeReport.SprintResult && (
                <td>{item.overplanEstimate.toFixed(1)}</td>
              )}
              {typeReport === TypeReport.SprintResult && (
                <td>{item.planRemaining.toFixed(1)}</td>
              )}
              {typeReport === TypeReport.SprintResult && (
                <td>{item.overplanRemaining.toFixed(1)}</td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="totalRow">
            <td>ИТОГО:</td>
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
              <td>{total.planRemaining.toFixed(1)}</td>
            )}
            {typeReport === TypeReport.SprintResult && (
              <td>{total.overplanRemaining.toFixed(1)}</td>
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
            <tr>
              <td>Процент выполнения</td>
              <td>
                {items.length > 0
                  ? `${((total.countClosed * 100) / items.length).toFixed(1)}%`
                  : '-'}
              </td>
            </tr>
            <tr>
              <td>Процент выполнения плановых задач спринта</td>
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
              <td>Процент выполнения внеплановых задач спринта</td>
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
