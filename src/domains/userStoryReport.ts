import { getWorkItemsByIds, WorkItemState } from './workItems';

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
  parentWorkItemId: number | null;
  parentName: string;
  state: string;
  isClosed: boolean;
  assignedToName: string;
  /** Плановая загрузка, часы */
  planEstimate: number;
  /** Фактическая выработка, часы */
  complete: number;
  /** Оставшаяся работа, часы */
  remaining: number;
  /** Добавленная загрузка, часы */
  overplanEstimate: number;
  order: number;
};

const USER_STORE_EMPTY_KEY = 0;

function createUserStoryReportItem(id: number): UserStoryReportItem {
  return {
    id,
    name: 'Empty',
    parentWorkItemId: null,
    parentName: '',
    state: '',
    isClosed: false,
    assignedToName: '',
    planEstimate: 0,
    complete: 0,
    remaining: 0,
    overplanEstimate: 0,
    order: 0,
  };
}

export async function getUserStoryReport({
  workItems,
}: GetUserStoryReportParams): Promise<UserStoryReportItem[]> {
  const userStoryMap = new Map<number, UserStoryReportItem>();

  for (const workItem of workItems) {
    const {
      parentWorkItemId,
      workItemType,
      overplan,
      originalEstimate,
      completedWork,
      remainingWork,
    } = workItem;

    if (['Task', 'Bug'].includes(workItemType)) {
      const key = parentWorkItemId || USER_STORE_EMPTY_KEY;
      const item = userStoryMap.get(key) || createUserStoryReportItem(key);
      userStoryMap.set(key, item);

      item.id = key;
      if (overplan) {
        item.overplanEstimate += originalEstimate;
      } else {
        item.planEstimate += originalEstimate;
      }
      item.complete += completedWork;
      item.remaining += remainingWork;
    } else {
      const key = workItem.id;
      const item = userStoryMap.get(key) || createUserStoryReportItem(key);
      userStoryMap.set(key, item);

      item.name = workItem.name;
      item.parentWorkItemId = parentWorkItemId;
      item.assignedToName = workItem.assignedTo.displayName;
      item.state = workItem.state;
      item.isClosed = workItem.isClosed;
      item.order = workItem.order;
    }
  }

  const userStories = [...userStoryMap.values()]; /*.sort(
    (a, b) => a.order - b.order
  );*/

  const featureIds = userStories
    .map(({ parentWorkItemId }) => parentWorkItemId)
    .filter((id): id is number => id !== null);

  const features = await getWorkItemsByIds(featureIds);
  const featureNamesMap = features.reduce((acc, feature) => {
    acc.set(feature.id, feature.fields['System.Title']);
    return acc;
  }, new Map<number, string>());

  return userStories.map((item) => ({
    ...item,
    parentName: item.parentWorkItemId
      ? featureNamesMap.get(item.parentWorkItemId) || ''
      : '',
  }));
}
