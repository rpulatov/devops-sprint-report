import { useState, useEffect } from 'react';
import {
  getUserStoryReport,
  UserStoryReportItem,
} from '../domains/userStoryReport';
import { WorkItemState } from '../domains/workItems';

export function useUserStories({ workItems }: { workItems: WorkItemState[] }) {
  const [items, setItems] = useState<UserStoryReportItem[]>([]);

  useEffect(() => {
    setItems([]);
    getUserStoryReport({ workItems }).then(setItems);
  }, [workItems]);

  return { userStories: items };
}
