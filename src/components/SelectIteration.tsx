import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';
import React from 'react';
import { useIterations } from '../domains';

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
    const items = [...iterations];
    return items.reverse();
  }, [iterations]);

  return (
    <select onChange={onChange}>
      <option value={undefined}>--</option>
      {iterationsSorted.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );
}
