import { useState, useEffect } from 'react';
import {
  getUserStoryReport,
  UserStoryReportItem,
} from '../domains/userStoryReport';
import { WorkItemState } from '../domains/workItems';

export function useUserStoryReport({
  workItems,
  completedStates,
}: {
  workItems: WorkItemState[];
  completedStates: Map<string, string[]>;
}) {
  const [userStories, setUserStories] = useState<UserStoryReportItem[]>([]);

  useEffect(() => {
    setUserStories([]);
    getUserStoryReport({ workItems, completedStates }).then(setUserStories);
  }, [workItems, completedStates]);

  return { userStories };
}
