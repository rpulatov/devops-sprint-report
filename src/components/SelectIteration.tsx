import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';
import React from 'react';
import { useIterations } from '../hooks/useIterations';

type SelectIterationProps = {
  projectId: string;
  onSelect: (iteration: TeamSettingsIteration) => void;
};
export function SelectIteration({ projectId, onSelect }: SelectIterationProps) {
  const { iterations } = useIterations({ projectId });

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedIteration = iterations.find(
        (item) => item.id === e.target.value
      );
      if (selectedIteration) onSelect(selectedIteration);
    },
    [iterations]
  );

  const iterationsSorted = React.useMemo(() => {
    const locate = 'ru-RU';
    const options1: Intl.DateTimeFormatOptions = {
      month: '2-digit',
      day: 'numeric',
    };

    const options2: Intl.DateTimeFormatOptions = {
      month: '2-digit',
      day: 'numeric',
      year: 'numeric',
    };

    const now = Date.now();

    const items = iterations.map((item) => {
      const startDateObj = new Date(item.attributes.startDate);
      startDateObj.setUTCHours(0, 0, 0, 0);

      const finishDateObj = new Date(item.attributes.finishDate);
      finishDateObj.setUTCHours(23, 59, 59, 999);

      return {
        ...item,
        startDate: startDateObj.toLocaleDateString(locate, options1),
        finishDate: finishDateObj.toLocaleDateString(locate, options2),
        currentSprint:
          Number(now) <= Number(finishDateObj) &&
          Number(now) >= Number(startDateObj),
      };
    });
    return items.reverse();
  }, [iterations]);

  return (
    <select onChange={onChange}>
      <option value={undefined}>--</option>
      {iterationsSorted.map((item) => (
        <option
          key={item.id}
          value={item.id}
          style={{ backgroundColor: item.currentSprint ? '#8ac4ff' : '' }}
        >
          {item.name} [{item.startDate} - {item.finishDate}]
        </option>
      ))}
    </select>
  );
}
