import { useMemo } from 'react';
import { WorkItemState } from '../domains/workItems';

type UserStoryReportProps = {
  workItems: WorkItemState[];
};
export function UserStoryReport({ workItems }: UserStoryReportProps) {
  return null;
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
