import { TeamProjectReference } from 'azure-devops-extension-api/Core';
import React from 'react';
import { useProjects } from '../hooks/useProjects';

type SelectProjectProps = {
  onSelect: (project: TeamProjectReference) => void;
};
export function SelectProject({ onSelect }: SelectProjectProps) {
  const { projects } = useProjects();

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedProject = projects.find(
        (item) => item.id === e.target.value
      );
      if (selectedProject) onSelect(selectedProject);
    },
    [projects]
  );

  return (
    <select onChange={onChange}>
      <option value={undefined}>--</option>
      {projects.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );
}
