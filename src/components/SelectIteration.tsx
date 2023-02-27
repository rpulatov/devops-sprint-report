import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';
import React from 'react';
import { useIterations } from '../domains';

type SelectIterationProps = {
  projectId: string;
  onSelect: (iteration: TeamSettingsIteration) => void;
};
export function SelectIteration({ projectId, onSelect }: SelectIterationProps) {
  const { iterations } = useIterations({ projectId });
  const [currentIterationId, setCurrentIterationId] = React.useState<
    string | undefined
  >();

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCurrentIterationId(e.target.value);
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
    <select onChange={onChange} value={currentIterationId}>
      {iterationsSorted.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );
}
