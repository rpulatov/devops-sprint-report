export class WorkTimelineItem {
  id: string = ""
  type: WorkTimelineItemType = WorkTimelineItemType.Task
  assignedTo: string = ""
  title: string = ""
  url: string = ""
  events: WorkTimelineItemEvent[] = []
}

export class WorkTimelineItemEvent {
  event: string = ""
  changedBy: string = ""
  changedAt: Date = new Date()

  constructor(
    event: string = "",
    changedBy: string = "",
    changedAt: Date = new Date()
  ) {
    this.event = event
    this.changedBy = changedBy
    this.changedAt = changedAt
  }
}

export enum WorkTimelineItemType {
  Task = "task",
  Bug = "bug",
  UserStory = "user-story",
  PR = "pr",
  Unknown = "unknown",
}

export enum WorkTimelineMode {
  Overview = "Общий",
  Detailed = "Детализированный",
}

export enum BugManagementMode {
  WithTasks = "Баги на уровне Tasks",
  WithRequirement = "Баги на уровне User Story",
}
