import { useMemo } from 'react';
import { UserStoryReportItem } from '../domains/userStoryReport';
import { TypeReport } from '../types/report';
import { Table } from './tables/Table';
import { TableColumn } from './tables/TableColumn';

type FeatureReportItem = {
  id: number;
  name: string;
  planEstimate: number;
  planComplete: number;
  overplanComplete: number;
};

function createFeatureReportItem(id: number, name: string): FeatureReportItem {
  return {
    id,
    name,
    planEstimate: 0,
    planComplete: 0,
    overplanComplete: 0,
  };
}

type FeatureReportProps = {
  userStories: UserStoryReportItem[];
  typeReport: TypeReport;
  htmlIdElement: string;
};
export function FeatureReport({
  userStories,
  typeReport,
  htmlIdElement,
}: FeatureReportProps) {
  const { data, total } = useMemo(() => {
    const total = {
      planEstimate: 0,
      planComplete: 0,
      overplanComplete: 0,
    };

    const featuresMap = userStories.reduce((map, item) => {
      if (!item.parentWorkItemId) return map;
      const feature: FeatureReportItem =
        map.get(item.parentWorkItemId) ??
        createFeatureReportItem(item.parentWorkItemId, item.parentName);

      feature.planEstimate += item.planEstimate;
      feature.planComplete += item.planComplete;
      feature.overplanComplete += item.overplanComplete;

      total.planEstimate += item.planEstimate;
      total.planComplete += item.planComplete;
      total.overplanComplete += item.overplanComplete;

      map.set(feature.id, feature);

      return map;
    }, new Map<number, FeatureReportItem>());

    const data = [...featuresMap.values()].map((feature) => ({
      id: feature.id,
      name: feature.name,
      planEstimate: feature.planEstimate,
      planEstimateInPerc:
        total.planEstimate > 0
          ? ((feature.planEstimate * 100) / total.planEstimate).toFixed(1) + '%'
          : '-',
      complete: feature.planComplete + feature.overplanComplete,
      completeInPerc:
        total.planComplete + total.overplanComplete > 0
          ? (
              ((feature.planComplete + feature.overplanComplete) * 100) /
              (total.planComplete + total.overplanComplete)
            ).toFixed(1) + '%'
          : '-',
    }));

    data.sort((a, b) => b.planEstimate - a.planEstimate);

    return {
      data,
      total,
    };
  }, [userStories]);

  return (
    <Table data={data} htmlIdElement={htmlIdElement}>
      <TableColumn
        name="name"
        title="Функционал (Feature)"
        renderFooter={() => 'ИТОГО:'}
      />
      <TableColumn
        name="planEstimateInPerc"
        title="Плановые часы в %"
        className="column-centered"
        renderFooter={() => '100%'}
      />
      {typeReport === TypeReport.SprintResult ? (
        <TableColumn
          name="completeInPerc"
          title="Фактические часы в %"
          className="column-centered"
          renderFooter={() => '100%'}
        />
      ) : null}
      <TableColumn
        name="planEstimate"
        title="Плановые часы"
        type="number"
        className="column-centered"
        renderFooter={() => total.planEstimate.toFixed(1)}
      />
      {typeReport === TypeReport.SprintResult ? (
        <TableColumn
          name="complete"
          title="Фактические часы"
          type="number"
          className="column-centered"
          renderFooter={() =>
            (total.planComplete + total.overplanComplete).toFixed(1)
          }
        />
      ) : null}
    </Table>
  );
}
