import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { errorNotification } from '../api/notificationObserver';
import { getCompletedStates, getWorkItemUpdatesById, getChildWorkItemsByWorkItem, getWorkItemsByWiql, getRelatedPRsByWorkItem, getPRThreadByPR, getWorkItemWebUrl } from '../domains/workItems';
import { WorkItem } from 'azure-devops-extension-api/WorkItemTracking';
import { addDays, isWeekend, min, parseISO } from 'date-fns';
import Modal from 'react-modal';
import { Timeline } from 'vis-timeline/esnext';

import { truncateMessage, getDatesArray, removeTime, getEnumKeys, differenceInBusinnessHours } from '../utils';
import { NotificationLayer } from '../components/NotificationLayer';
import { WorkTimelineItem, WorkTimelineItemEvent, WorkTimelineItemType, WorkTimelineMode } from '../types/timeline';

import './WorkTimeline.css';

function WorkTimeline() {
    const navigate = useNavigate();

    const [workItemId, setWorkItemId] = useState('');
    const [currentWorkItem, setWorkItem] = useState<WorkItem | null>(null);
    const [workItemLoading, setWorkItemLoading] = useState(false);
    const [timelineData, setTimelineData] = useState<WorkTimelineItem[]>([]);
    const [timelineDataLoading, setTimelineDataLoading] = useState(false);
    const [timeline, setTimeline] = useState<Timeline | null>(null);
    const [timelineMode, setTimelineMode] = useState<WorkTimelineMode>(WorkTimelineMode.Overview);
    const [completedStates, setCompletedStates] = useState<Map<string, string[]>>(new Map());
    
    // settings
    const [settingsChanged, setSettingsChanged] = useState(0);
    const [showInactivityWindows, setShowInactivityWindows] = useState(true);
    const [avgWorkdayStartHour, setAvgWorkdayStartHour] = useState(9);
    const [avgWorkdayEndHour, setAvgWorkdayEndHour] = useState(18);
    const [inactivityWindowInHours, setInactivityWindowInHours] = useState(3);
    const [timeToTestInHours, setTimeToTestInHours] = useState(2);
    const [timeToPRInHours, setTimeToPRInHours] = useState(4);
    const [settingsModalIsOpen, setSettingsModalIsOpen] = useState(false);

    const openSettingsModal = () => {
        setSettingsModalIsOpen(true);
    };
    const closeSettingsModal = () => {
        setSettingsModalIsOpen(false);
    };
    useEffect(() => {
        const settingsStr = localStorage.getItem('settings');
        if (settingsStr) {
            const settings = JSON.parse(settingsStr);
            setShowInactivityWindows(settings.showInactivityWindows);
            setAvgWorkdayStartHour(settings.avgWorkdayStartHour);
            setAvgWorkdayEndHour(settings.avgWorkdayEndHour);
            setInactivityWindowInHours(settings.inactivityWindowInHours);
            setTimeToTestInHours(settings.timeToTestInHours);
            setTimeToPRInHours(settings.timeToPRInHours);
        }
    }, []);
    useEffect(() => {
        localStorage.setItem('settings', JSON.stringify({
            showInactivityWindows,
            avgWorkdayStartHour,
            avgWorkdayEndHour,
            inactivityWindowInHours,
            timeToTestInHours,
            timeToPRInHours,
        }));
        setSettingsChanged(settingsChanged + 1)
    }, [showInactivityWindows, avgWorkdayStartHour, avgWorkdayEndHour, inactivityWindowInHours, timeToTestInHours, timeToPRInHours]);

    useEffect(() => {
        if (timelineData.length > 0) {
            drawTimeline();
        }
    }, [timelineData, timelineMode, settingsChanged]);

    const handleWorkItemChangeButtonClick = () => {
        const load = async () => {
            if (workItemId === '') throw new Error('WorkItem is not specified');

            setWorkItemLoading(true);
            const workItems = await getWorkItemsByWiql({
                projectId: undefined,
                teamId: undefined,
                query: `SELECT [System.Title], [System.WorkItemType] FROM WorkItems WHERE [System.Id] = ${workItemId}`
            });
            
            if (workItems.length === 0) throw new Error('WorkItem not found');
            if (workItems.length > 1) throw new Error('Multiple WorkItems found');
            
            const workItem = workItems[0];
            if (workItem.fields['System.WorkItemType'] !== 'User Story') throw new Error('WorkItem is not a UserStory');

            return workItem;
        };
    
        return load().then(setWorkItem).catch(errorNotification).finally(() => setWorkItemLoading(false));
    };

    const handleLoadTimelineDataClick = async () => {
        const load = async () => {
            setTimelineDataLoading(true);
            if (!currentWorkItem) throw new Error('WorkItem is not specified');

            let data: WorkTimelineItem[] = [];
            
            const completedStates = await getCompletedStates({ projectId: currentWorkItem.fields['System.TeamProject'] });
            setCompletedStates(completedStates);

            const load_work_item_state_events = async (workItemId: number) => {
                // get events with state changed
                return await getWorkItemUpdatesById(workItemId)
                    .then((workItemUpdates) => workItemUpdates
                        .filter((workItemUpdate) => workItemUpdate.fields && workItemUpdate.fields.hasOwnProperty('System.State'))
                        .map((workItemUpdate) => {
                            let res = new WorkTimelineItemEvent();
                            res.changedAt = workItemUpdate.fields['System.ChangedDate'].newValue;
                            res.changedBy = workItemUpdate.revisedBy.displayName;
                            res.event = workItemUpdate.fields['System.State'].newValue
                            return res;
                        }
                    )
                );
            }

            // load data about user story
            const ti = new WorkTimelineItem();
            ti.id = `wi-${currentWorkItem.id}`;
            ti.type = WorkTimelineItemType.UserStory;
            ti.title = currentWorkItem.fields['System.Title'];
            ti.assignedTo = currentWorkItem.fields['System.AssignedTo']?.displayName;
            ti.url = getWorkItemWebUrl(currentWorkItem.id);
            ti.events = await load_work_item_state_events(currentWorkItem.id);
            data.push(ti);

            // load data about children
            const child_work_items = await getChildWorkItemsByWorkItem(currentWorkItem);
            const child_tis = await Promise.all(child_work_items.map(async (child_work_item) => {
                const ti = new WorkTimelineItem();
                ti.id = `wi-${child_work_item.id}`;
                if (child_work_item.fields['System.WorkItemType'] === 'Task') {
                    ti.type = WorkTimelineItemType.Task;
                } else if (child_work_item.fields['System.WorkItemType'] === 'Bug') {
                    ti.type = WorkTimelineItemType.Bug;
                } else {
                    ti.type = WorkTimelineItemType.Unknown;
                }
                ti.title = child_work_item.fields['System.Title'];
                ti.assignedTo = child_work_item.fields['System.AssignedTo']?.displayName;
                ti.url = getWorkItemWebUrl(child_work_item.id);
                ti.events = await load_work_item_state_events(child_work_item.id);
                return ti;
            }));
            data.push(...child_tis);

            // load data about PRs
            const wit = [currentWorkItem].concat(child_work_items);
            const prs = await Promise.all(
                wit.map(async (work_item) =>
                    await getRelatedPRsByWorkItem(work_item)
                )
            ).then((prs) => 
                prs
                .flat()
                // take distinct prs
                .filter((pr, index, self) =>
                    self.findIndex((p) => p.pullRequestId === pr.pullRequestId) === index)
            );
            const pr_tis = await Promise.all(prs.map(async (pr) => {
                const ti = new WorkTimelineItem();
                ti.id = `pr-${pr.pullRequestId}`;
                ti.type = WorkTimelineItemType.PR;
                ti.title = pr.title;
                ti.assignedTo = pr.createdBy.displayName;

                ti.events = [];
                ti.events.push(new WorkTimelineItemEvent('Created', pr.createdBy.displayName, pr.creationDate));

                const pr_thread = await getPRThreadByPR(pr);
                const pr_thread_events = pr_thread
                    .map((pr_thread_item) => pr_thread_item.comments)
                    .flat()
                    .filter((pr_thread_comment) => pr_thread_comment.author.displayName !== 'Microsoft.VisualStudio.Services.TFS')
                    .map((pr_thread_comment) => {
                        let res = new WorkTimelineItemEvent();
                        res.changedAt = pr_thread_comment.publishedDate;
                        res.changedBy = pr_thread_comment.author.displayName;
                        res.event = pr_thread_comment.content;
                        return res;
                    });
                ti.events.push(...pr_thread_events);

                ti.events.push(new WorkTimelineItemEvent('Closed', pr.closedBy?.displayName, pr.closedDate));
                return ti;
            }));
            data.push(...pr_tis);

            return data
        }

        return load().then(setTimelineData).catch(errorNotification).finally(() => setTimelineDataLoading(false));
    }
    
    const drawTimeline = () => {
        // parse date strings to Date objects
        const _timelineData: WorkTimelineItem[] = timelineData.map((timelineItem) => ({
            ...timelineItem,
            events: timelineItem.events.map((timelineItemEvent) => ({
                ...timelineItemEvent,
                // @ts-expect-error
                changedAt: parseISO(timelineItemEvent.changedAt),
            })) as WorkTimelineItemEvent[],
        }));

        // create timeline groups by items
        const getTimelineItemLink = (timelineItem: WorkTimelineItem, text: string) => {
            if (timelineItem.url)
                return `<a href="${timelineItem.url}" target="_blank">${text}</a>`
            return text
        }

        const timelineGroups = _timelineData
            .map((timelineItem) => ({
                id: timelineItem.id,
                content: `<div>${timelineItem.type}</div>${getTimelineItemLink(timelineItem, truncateMessage(timelineItem.title, 60))}<br><b>${truncateMessage(timelineItem.assignedTo, 20)}</b>`,
                className: `vis-${timelineItem.type}`,
                order: min(timelineItem.events.map((timelineItemEvent) => timelineItemEvent.changedAt)) // sorting
            }));

        // create timeline items by events in items
        const timelineItems = _timelineData
            .map((timelineItem) =>
                timelineItem.events.map((timelineItemEvent) => ({
                    start: timelineItemEvent.changedAt,
                    content: timelineMode === WorkTimelineMode.Overview ? truncateMessage(timelineItemEvent.event, 10) : `${truncateMessage(timelineItemEvent.changedBy, 15)}<br>${truncateMessage(timelineItemEvent.event, 15)}`,
                    title: timelineMode === WorkTimelineMode.Detailed ? '' : `${timelineItemEvent.changedBy}<br>${timelineItemEvent.event}<br>${timelineItemEvent.changedAt}`,
                    className: `vis-${timelineItem.type}`,
                    group: timelineItem.id,
                    type: timelineMode === WorkTimelineMode.Overview ? 'point' : 'box',
                    showMajorLabels: timelineMode === WorkTimelineMode.Detailed,
                }))
            ).flat();

        // create backgrounds for weekends
        const min_date = timelineItems.reduce((min, p) => p.start < min ? p.start : min, timelineItems[0].start);
        const max_date = timelineItems.reduce((max, p) => p.start > max ? p.start : max, timelineItems[0].start);
        const weekdaysTimelineItems = getDatesArray(min_date, max_date)
                .filter((date) => isWeekend(date))
                .map((date) => 
                    timelineGroups.map((timelineGroup) => ({
                        start: removeTime(date),
                        end: addDays(removeTime(date), 1),
                        content: '',
                        className: 'vis-weekend',
                        group: timelineGroup.id,
                        type: 'background',
                        title: 'Выходные',
                        showMajorLabels: false,
                    })
                )).flat();

        // create background for no activity times
        const itemsIntervals = _timelineData
            .filter((timelineItem) => timelineItem.type !== WorkTimelineItemType.UserStory)
            .map((timelineItem) => ({
                periodStart: timelineItem.events.reduce((min, p) => p.changedAt < min ? p.changedAt : min, timelineItem.events[0].changedAt),
                periodEnd: timelineItem.events.reduce((max, p) => p.changedAt > max ? p.changedAt : max, timelineItem.events[0].changedAt),
            }));
        const intervalEvents = itemsIntervals
            .map((itemInterval) => [
                {
                    datetime: itemInterval.periodStart,
                    type: 'start',
                },
                {
                    datetime: itemInterval.periodEnd,
                    type: 'end',
                }
            ])
            .flat()
            .sort((a, b) => a.datetime > b.datetime ? 1 : -1);

        const inactivityWindows = [];
        let overlappingCounter = 0;
        for (let i = 0; i < intervalEvents.length - 1; i++) {
            const intervalEvent = intervalEvents[i];
            if (intervalEvent.type === 'start') {
                overlappingCounter++;
            } else {
                overlappingCounter--;
            }
            if (overlappingCounter === 0) {
                inactivityWindows.push({
                    start: intervalEvent.datetime,
                    end: intervalEvents[i + 1].datetime,
                });
            }
        }

        const inactivityWindowsTimelineItems = inactivityWindows
            .filter((inactivityWindow) => 
                differenceInBusinnessHours(
                    inactivityWindow.start,
                    inactivityWindow.end,
                    avgWorkdayStartHour,
                    avgWorkdayEndHour,
                ) >= inactivityWindowInHours
            )
            .map((inactivityWindow) =>
                timelineGroups.map((timelineGroup) => ({
                    start: inactivityWindow.start,
                    end: inactivityWindow.end,
                    content: '',
                    className: 'vis-inactivity-window',
                    group: timelineGroup.id,
                    type: 'background',
                    title: 'Отсутствует активность',
                    showMajorLabels: false,
                }))
            ).flat();

        // create background for long time not tested tasks
        const notTestedWindowsTimelineItems = _timelineData
            .filter((timelineItem) =>
                [WorkTimelineItemType.Task,
                WorkTimelineItemType.Bug,
                WorkTimelineItemType.UserStory]
                .includes(timelineItem.type))
            .map((timelineItem) => {
                const notTestedWindows = [];
                const orderedEvents = timelineItem.events.sort((a, b) => a.changedAt > b.changedAt ? 1 : -1);
                for (let i = 0; i < orderedEvents.length - 1; i++) {
                    const event = orderedEvents[i];
                    if (event.event.toLocaleLowerCase().includes('qa')) {
                        const nextEvent = orderedEvents[i + 1];
                        notTestedWindows.push({
                            item: timelineItem,
                            start: event.changedAt,
                            end: nextEvent.changedAt,
                        });
                    }
                }
                return notTestedWindows;
            })
            .flat()
            .filter((notTestedWindow) =>
                differenceInBusinnessHours(
                    notTestedWindow.start,
                    notTestedWindow.end,
                    avgWorkdayStartHour,
                    avgWorkdayEndHour,
                ) >= timeToTestInHours
            )
            .map((notTestedWindow) => ({
                start: notTestedWindow.start,
                end: notTestedWindow.end,
                content: '',
                className: 'vis-inactivity-window not-tested',
                group: notTestedWindow.item.id,
                type: 'background',
                title: 'Отсутствует активность в тестировании',
                showMajorLabels: false,
            }));

        // create background for long time not activity PRs
        const notActivityPRsTimelineItems = _timelineData
            .filter((timelineItem) =>
                [WorkTimelineItemType.PR]
                .includes(timelineItem.type))
            .map((timelineItem) => {
                const items = [];
                const orderedEvents = timelineItem.events.sort((a, b) => a.changedAt > b.changedAt ? 1 : -1);
                let lastPRActivity: WorkTimelineItemEvent | null = orderedEvents[0];
                for (let i = 0; i < orderedEvents.length; i++) {
                    const event = orderedEvents[i];
                    // Ищем след активность
                    if (!lastPRActivity) {
                        if (!event.event.toLocaleLowerCase().includes('voted')) {
                            lastPRActivity = event;
                        }
                    }
                    // Произошло ревью
                    if (lastPRActivity &&
                        event.event.toLocaleLowerCase().includes('voted')) {
                        items.push({
                            item: timelineItem,
                            start: lastPRActivity.changedAt,
                            end: event.changedAt,
                        });
                        lastPRActivity = null;
                    }
                }
                return items;
            })
            .flat()
            .filter((noActivityPRWindow) => 
                differenceInBusinnessHours(
                    noActivityPRWindow.start,
                    noActivityPRWindow.end,
                    avgWorkdayStartHour,
                    avgWorkdayEndHour,
                ) >= timeToPRInHours
            )
            .map((noActivityPRWindow) => ({
                start: noActivityPRWindow.start,
                end: noActivityPRWindow.end,
                content: '',
                className: 'vis-inactivity-window pr',
                group: noActivityPRWindow.item.id,
                type: 'background',
                title: 'Отсутствует активность в ревью',
                showMajorLabels: false,
            }));

        // add all backgrounds to timeline items
        timelineItems.push(...weekdaysTimelineItems);
        if (showInactivityWindows) {
            timelineItems.push(...inactivityWindowsTimelineItems);
            timelineItems.push(...notTestedWindowsTimelineItems);
            timelineItems.push(...notActivityPRsTimelineItems);
        }

        // draw timeline
        const options = {
            start: min_date,
        };
    
        timeline?.destroy();
        const _timeline = new Timeline(
            document.getElementById('timeline') as HTMLElement,
            timelineItems,
            timelineGroups,
            options,
        );
        setTimeline(_timeline);
    }

    return (
        <>
            <link href="https://unpkg.com/vis-timeline@latest/styles/vis-timeline-graph2d.min.css" rel="stylesheet" type="text/css" />
            <div className='header'>
                <div>
                    <input
                        value={workItemId}
                        onChange={e => setWorkItemId(e.target.value)}
                        placeholder='User Story ID'
                    />
                    <button
                        onClick={handleWorkItemChangeButtonClick}
                        disabled={workItemLoading}
                    >
                        Применить WorkItem
                    </button>
                </div>
                <div>
                    <button onClick={() => navigate('/')}>На главную</button>
                </div>
            </div>
            <div>
                <br/>
                <label>Выбранная User Story: </label>{currentWorkItem ? currentWorkItem.fields['System.Title'] : 'Не выбран WorkItem'}
                <br/>
                <br/>
                {currentWorkItem && 
                    <>
                        <label>Вид таймлайна: </label>
                        <select
                            onChange={(e) => {
                                setTimelineMode(WorkTimelineMode[e.target.value as keyof typeof WorkTimelineMode]);
                            }}
                            >
                            {getEnumKeys(WorkTimelineMode).map((key, index) => (
                                <option key={index} value={key}>
                                {WorkTimelineMode[key]}
                                </option>
                            ))}
                        </select>
                        <button onClick={openSettingsModal}>Настройки</button>
                        <Modal isOpen={settingsModalIsOpen} onRequestClose={closeSettingsModal} ariaHideApp={false}>
                            <label>Показывать неактивные окна?</label>
                            <input type="checkbox"
                                checked={showInactivityWindows}
                                onChange={(e) => setShowInactivityWindows(e.target.checked)}
                            />
                            <br/>
                            <label>Примерное время рабочего дня (в часах)</label>
                            <label> с </label>
                            <input
                                type="number"
                                value={avgWorkdayStartHour}
                                onChange={(e) => setAvgWorkdayStartHour(Number(e.target.value))}
                            />
                            <label> до </label>
                            <input
                                type="number"
                                value={avgWorkdayEndHour}
                                onChange={(e) => setAvgWorkdayEndHour(Number(e.target.value))}
                            />
                            <br/>
                            <label>Отметить, если на таймлайне нет активности в течение </label>
                            <input
                                type="number"
                                value={inactivityWindowInHours}
                                onChange={(e) => setInactivityWindowInHours(Number(e.target.value))}
                            />
                            <label> рабочих часов</label>
                            <br/>
                            <label>Отметить, если задача не тестировалась в течение </label>
                            <input
                                type="number"
                                value={timeToTestInHours}
                                onChange={(e) => setTimeToTestInHours(Number(e.target.value))}
                            />
                            <label> рабочих часов</label>
                            <br/>
                            <label>Отметить, если PR не проходил ревью в течение </label>
                            <input
                                type="number"
                                value={timeToPRInHours}
                                onChange={(e) => setTimeToPRInHours(Number(e.target.value))}
                            />
                            <label> рабочих часов</label>
                        </Modal>
                        <button
                            onClick={handleLoadTimelineDataClick}
                            disabled={timelineDataLoading}
                        >
                            Отрисовать таймлайн
                        </button>
                    </>
                }
            </div>
            <div id="timeline" />
            <NotificationLayer />
        </>
    )
}

export default WorkTimeline;