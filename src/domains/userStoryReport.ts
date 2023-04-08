import {
  getDataFromWorkItem,
  getWorkItemsByIds,
  WorkItemState,
} from './workItems';

export type GetUserStoryReportParams = {
  workItems: WorkItemState[];
};

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
  planComplete: number;
  /** Оставшаяся работа из плановых, часы */
  planRemaining: 0;
  /** Добавленная загрузка, часы */
  overplanEstimate: number;
  overplanComplete: number;
  /** Оставшаяся работа из внеплановых, часы */
  overplanRemaining: 0;
  order: number;
};

const USER_STORE_EMPTY_KEY = -1;

function createUserStoryReportItem(id: number): UserStoryReportItem {
  return {
    id,
    name: '',
    parentWorkItemId: null,
    parentName: '',
    state: '',
    isClosed: false,
    assignedToName: '',
    planEstimate: 0,
    planComplete: 0,
    planRemaining: 0,
    overplanEstimate: 0,
    overplanComplete: 0,
    overplanRemaining: 0,
    order: 0,
  };
}

function createOrUpdateUserStoryMap(
  map: Map<number, UserStoryReportItem>,
  workItem: WorkItemState
) {
  const key = workItem.id;
  const item = map.get(key) || createUserStoryReportItem(key);
  map.set(key, item);

  item.name = workItem.name;
  item.parentWorkItemId = workItem.parentWorkItemId;
  item.assignedToName = workItem.assignedTo?.displayName || '-';
  item.state = workItem.state;
  item.isClosed = workItem.isClosed;
  item.order = workItem.order;
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

    if (!['Task', 'Bug'].includes(workItemType)) {
      createOrUpdateUserStoryMap(userStoryMap, workItem);
      continue;
    }
    const key = parentWorkItemId || USER_STORE_EMPTY_KEY;

    const item = userStoryMap.get(key) || createUserStoryReportItem(key);
    userStoryMap.set(key, item);

    item.id = key;
    if (overplan) {
      item.overplanEstimate += originalEstimate;
      item.overplanRemaining += remainingWork;
      item.overplanComplete += completedWork;
    } else {
      item.planEstimate += originalEstimate;
      item.planRemaining += remainingWork;
      item.planComplete += completedWork;
    }
  }

  // add user story from another sprint
  const emptyUserStoryIds = [...userStoryMap.values()]
    .filter((item) => !item.name && item.id !== USER_STORE_EMPTY_KEY)
    .map(({ id }) => id);
  const emptyUserStories = await getWorkItemsByIds(emptyUserStoryIds);
  emptyUserStories.forEach((item) => {
    const workItem = getDataFromWorkItem(item);
    workItem.name = `(Wrong Sprint) ${workItem.name}`;
    createOrUpdateUserStoryMap(userStoryMap, workItem);
  });

  // sort
  const userStories = [...userStoryMap.values()].sort(
    (a, b) => a.order - b.order
  );

  // add features
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
