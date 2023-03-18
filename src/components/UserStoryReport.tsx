import { useMemo, useEffect, useState } from 'react';
import {
  getUserStoryReport,
  UserStoryReportItem,
} from '../domains/userStoryReport';
import { WorkItemState } from '../domains/workItems';

type UserStoryReportProps = {
  workItems: WorkItemState[];
};
export function UserStoryReport({ workItems }: UserStoryReportProps) {
  const [items, setItems] = useState<UserStoryReportItem[]>([]);

  useEffect(() => {
    setItems([]);
    getUserStoryReport({ workItems }).then(setItems);
  }, [workItems]);

  return (
    <table>
      <thead>
        <tr>
          <th>Цель спринта (User Story)</th>
          <th>Функционал (Feature)</th>
          <th>Статус</th>
          <th>Ответственный</th>

          <th>Плановая загрузка, часы</th>
          <th>Фактическая выработка, часы</th>
          <th>Добавленная загрузка, часы</th>
          <th>Оставшаяся работа, часы</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.parentName}</td>
            <td>{item.state}</td>
            <td>{item.assignedToName}</td>

            <td>{item.planEstimate}</td>
            <td>{item.complete}</td>
            <td>{item.overplanEstimate}</td>
            <td>{item.remaining}</td>
          </tr>
        ))}
      </tbody>
    </table>
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
