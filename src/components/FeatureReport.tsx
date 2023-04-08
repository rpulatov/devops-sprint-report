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
};
export function FeatureReport({ userStories, typeReport }: FeatureReportProps) {
  const features = useMemo(() => {
    const featuresMap = userStories.reduce((map, item) => {
      if (!item.parentWorkItemId) return map;
      const feature: FeatureReportItem =
        map.get(item.parentWorkItemId) ??
        createFeatureReportItem(item.parentWorkItemId, item.parentName);

      feature.planEstimate += item.planEstimate;
      feature.planComplete += item.planComplete;
      feature.overplanComplete += item.overplanComplete;

      map.set(feature.id, feature);

      return map;
    }, new Map<number, FeatureReportItem>());
    return [...featuresMap.values()];
  }, [userStories]);

  const total = useMemo(
    () =>
      userStories.reduce(
        (acc, item) => {
          acc.planEstimate += item.planEstimate;
          acc.planComplete += item.planComplete;
          acc.overplanComplete += item.overplanComplete;
          return acc;
        },
        {
          planEstimate: 0,
          planComplete: 0,
          overplanComplete: 0,
        }
      ),
    [userStories]
  );

  return (
    <Table data={features}>
      <TableColumn
        name="name"
        title="Функционал (Feature)"
        renderFooter={() => 'ИТОГО:'}
      />
      <TableColumn
        name="planEstimate"
        title="Плановые часы"
        type="number"
        className="column-centered"
        renderFooter={() => total.planEstimate.toFixed(1)}
      />
      {typeReport === TypeReport.SprintResult ? (
        <TableColumn
          name="planComplete"
          title="Фактические часы"
          type="number"
          className="column-centered"
          render={(item: FeatureReportItem) =>
            item.planComplete + item.overplanComplete
          }
          renderFooter={() =>
            (total.planComplete + total.overplanComplete).toFixed(1)
          }
        />
      ) : null}
    </Table>
  );
}
