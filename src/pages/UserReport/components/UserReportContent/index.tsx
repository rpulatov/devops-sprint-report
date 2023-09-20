import format from "date-fns/format";
import startOfMonth from "date-fns/startOfMonth";
import { Page } from "azure-devops-ui/Page";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { Button } from "azure-devops-ui/Button";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";

import { Card } from "azure-devops-ui/Card";
import React from "react";
import SelectDateRange from "../SelectDateRange";
import { IntervalOfWork } from "../../../../types/report";
import { TeamSettingsIteration } from "azure-devops-extension-api/Work";
import { TeamProjectReference } from "azure-devops-extension-api/Core";

import "./UserReportContent.css";

export interface IterationAcrossProjects extends TeamSettingsIteration {
  project: {
    id: string;
    name: string;
  };
}

export type UserReportContentProps = {
  iterations: IterationAcrossProjects[];
  projects: TeamProjectReference[];
};

export function UserReportContent({
  iterations,
  projects,
}: UserReportContentProps) {
  const [dateRange, setDateRange] = React.useState(() => ({
    startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  }));

  const [maxIterationDate, minIterationDate] = React.useMemo(() => {
    let max: Date | null = null,
      min: Date | null = null;

    iterations.forEach((iteration) => {
      if (!min || iteration.attributes.startDate < min) {
        min = iteration.attributes.startDate;
      }
      if (!max || iteration.attributes.finishDate > max) {
        max = iteration.attributes.finishDate;
      }
    });
    return [max, min] as [Date | null, Date | null];
  }, [iterations]);

  const [intervalOfWork, setIntervalOfWork] =
    React.useState<IntervalOfWork | null>(null);

  const [loading, setLoading] = React.useState(false);

  const onSubmit = React.useCallback(() => {
    setLoading(true);
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
      </div>
    </div>
  );
}
