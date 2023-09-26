import format from "date-fns/format";
import startOfMonth from "date-fns/startOfMonth";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { Button } from "azure-devops-ui/Button";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";

import { Card } from "azure-devops-ui/Card";
import React from "react";
import SelectDateRange from "../SelectDateRange";
import { IntervalOfWork } from "../../../../types/report";
import { TeamProjectReference } from "azure-devops-extension-api/Core";

import { useMinMaxIterations } from "./hooks/useMinMaxIterations";
import {
  IterationAcrossProjects,
  TeamMemberWithInterval,
  useUserReport,
} from "./hooks/useUserReport";
import getOverlappingDaysInIntervals from "date-fns/getOverlappingDaysInIntervals";
import endOfDay from "date-fns/endOfDay";
import merge from "lodash/merge";

import { errorNotification } from "../../../../api/notificationObserver";

import "./UserReportContainer.css";

export type UserReportContentProps = {
  iterations: IterationAcrossProjects[];
  projects: TeamProjectReference[];
  children: React.ReactElement<{ teamMembers: TeamMemberWithInterval[] }>;
};

export function UserReportContainer({
  iterations,
  projects,
  children,
}: UserReportContentProps) {
  const [dateRange, setDateRange] = React.useState(() => ({
    startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  }));
  const [intervalOfWork, setIntervalOfWork] =
    React.useState<IntervalOfWork | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [maxIterationDate, minIterationDate] = useMinMaxIterations(iterations);
  const [teamMembers, setTeamMembers] = React.useState<
    TeamMemberWithInterval[]
  >([]);

  const {
    generateWorkIntervals,
    getUserReportByIteration,
    joinTeamMembersWithIntervals,
  } = useUserReport();

  const onSubmit = React.useCallback(async () => {
    if (!intervalOfWork) return;
    setLoading(true);
    try {
      const startDateOfRange = new Date(dateRange.startDate);
      const endDateOfRange = endOfDay(new Date(dateRange.endDate));

      // определить интервалы для отображения
      const intervals = generateWorkIntervals(intervalOfWork, {
        startDate: startDateOfRange,
        endDate: endDateOfRange,
      });

      // отфильтровать только те итерации, которые пересекаются с выбранным диапазоном дат
      const filteredIterations = iterations.filter((iteration) =>
        getOverlappingDaysInIntervals(
          {
            start: iteration.attributes.startDate,
            end: iteration.attributes.finishDate,
          },
          {
            start: startDateOfRange,
            end: endDateOfRange,
          }
        )
      );

      const teamMembers = await Promise.all(
        filteredIterations.map((iteration) =>
          getUserReportByIteration(iteration)
        )
      ).then((arrayOfTeamMembers) =>
        arrayOfTeamMembers.reduce(
          (prevTeamMembers, teamMembers) => merge(prevTeamMembers, teamMembers),
          {}
        )
      );

      const teamMembersWithIntervals = joinTeamMembersWithIntervals(
        teamMembers,
        intervals
      );

      setTeamMembers(teamMembersWithIntervals);
    } catch (e) {
      errorNotification(e);
    }
    setLoading(false);
  }, [intervalOfWork, dateRange, iterations]);

  return (
    <div className="page-content page-content-top">
      <div className="user-report-legend">
        <span>Проекты: {projects.length} шт</span>
        <span>
          Даты итераций:{" "}
          {minIterationDate ? format(minIterationDate, "dd.MM.yyyy") : ""}
          {" - "}
          {maxIterationDate ? format(maxIterationDate, "dd.MM.yyyy") : ""}
        </span>
      </div>
      <Card className="user-report-filter">
        {/* <div className="user-report-filter_field">
      <div className="user-report-filter_input">
        <IdentityPicker />
      </div>
    </div> */}
        <div className="user-report-filter_field">
          <span className="user-report-filter_label">
            Посчитать работу в диапазоне:
          </span>
          <SelectDateRange
            minDate={
              minIterationDate ? format(minIterationDate, "yyyy-MM-dd") : ""
            }
            maxDate={
              maxIterationDate ? format(maxIterationDate, "yyyy-MM-dd") : ""
            }
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={(startDate, endDate) =>
              setDateRange({ startDate, endDate })
            }
          />
        </div>
        <div className="user-report-filter_field">
          <span className="user-report-filter_label">Группировать по:</span>
          <Dropdown<{ id: IntervalOfWork; text: string }>
            ariaLabel="Basic"
            placeholder="Выберите группировку"
            items={[
              { id: IntervalOfWork.Day, text: "Дням" },
              { id: IntervalOfWork.Week, text: "Неделям" },
              { id: IntervalOfWork.Month, text: "Месяцам" },
            ]}
            onSelect={(e, item) => setIntervalOfWork(item.id as IntervalOfWork)}
          />
        </div>
        <div className="user-report-filter_field">
          <Button
            text="Построить отчет"
            iconProps={{ iconName: "Forward" }}
            primary
            onClick={onSubmit}
          />
        </div>
      </Card>
      <div className="page-content-top">
        {loading ? <Spinner size={SpinnerSize.large} /> : null}
        {React.cloneElement(children, { teamMembers })}
      </div>
    </div>
  );
}
