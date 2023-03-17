import { WorkItemState } from './workItems';

export type GetUserStoryReportParams = {
  workItems: WorkItemState[];
};

// user story
// -- наименование
// -- название фичи
// -- статус
// -- ответственный
export type UserStoryReportItem = {
  id: number;
  name: string;
  /** Плановая загрузка, часы */
  planEstimate: number;
  /** Фактическая выработка, часы */
  planComplete: number;
  /** Оставшаяся работа, часы */
  planRemaining: number;
  /** Добавленная загрузка, часы */
  overplanEstimate: number;
  // overplanComplete: number;
  // overplanRemaining: number;
};

const USER_STORE_EMPTY_KEY = 0;

function createUserStoryReportItem(id: number): UserStoryReportItem {
  return {
    id,
    name: '',
    planEstimate: 0,
    planComplete: 0,
    planRemaining: 0,
    overplanEstimate: 0,
  };
}

export async function getUserStoryReport({
  workItems,
}: GetUserStoryReportParams) {
  const userStoryMap = new Map<number, UserStoryReportItem>();

  for (const {
    parentWorkItemId,
    workItemType,
    overplan,
    originalEstimate,
    completedWork,
    remainingWork
  } of workItems) {
    if (['Task', 'Bug'].includes(workItemType)) {
      const key = parentWorkItemId || USER_STORE_EMPTY_KEY;
      const item = userStoryMap.get(key) || createUserStoryReportItem(key);
      userStoryMap.set(key, item);

      item.id = key;
      if (overplan) {
        item.overplanEstimate += originalEstimate;
      } else {
        item.planEstimate += originalEstimate;
        item.planComplete += completedWork
        item.planRemaining += remainingWork
      }
    }
  }
}
