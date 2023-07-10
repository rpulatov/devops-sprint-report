import { useState, useEffect } from 'react';
import {
  getUserStoryReport,
  UserStoryReportItem,
} from '../domains/userStoryReport';
import { WorkItemState } from '../domains/workItems';

export function useUserStoryReport({
  workItems,
}: {
  workItems: WorkItemState[];
}) {
  const [userStories, setUserStories] = useState<UserStoryReportItem[]>([]);

  useEffect(() => {
    setUserStories([]);
    getUserStoryReport({ workItems }).then(setUserStories);
  }, [workItems]);

  return { userStories };
}
