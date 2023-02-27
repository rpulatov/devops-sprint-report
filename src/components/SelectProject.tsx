import { TeamProjectReference } from 'azure-devops-extension-api/Core';
import React from 'react';
import { useProjects } from '../domains';

type SelectProjectProps = {
  onSelect: (project: TeamProjectReference) => void;
};
export function SelectProject({ onSelect }: SelectProjectProps) {
  const { projects } = useProjects();
  const [currentProjectId, setCurrentProjectId] = React.useState<
    string | undefined
  >();

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCurrentProjectId(e.target.value);
      const selectedProject = projects.find(
        (item) => item.id === e.target.value
      );
      if (selectedProject) onSelect(selectedProject);
    },
    [projects]
  );

  return (
    <select onChange={onChange} value={currentProjectId}>
      {projects.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );
}
