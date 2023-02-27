import { useCallback } from 'react';
import { useCapacity } from '../domains/capacity';

type DataLayerProps = {
  projectId: string;
  teamId: string;
  iterationId: string;
};
export function DataLayer(props: DataLayerProps) {
  const { teamMembers } = useCapacity(props);

  return (
    <div>
      {teamMembers.map((member) => (
        <div key={member.teamMember.id}>
          <div>{member.teamMember.displayName}</div>
        </div>
      ))}
    </div>
  );
}
