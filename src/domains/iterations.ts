import { fetchAzure } from "../api";
import { TeamSettingsIteration } from "azure-devops-extension-api/Work";

export type GetIterationsParams = { projectId: string };
export async function getIterations({ projectId }: GetIterationsParams) {
  return fetchAzure("/work/teamsettings/iterations", { projectId }).then(
    (res: { count: number; value: TeamSettingsIteration[] }) => res.value
  );
}

export type GetIterationCapacitiesProps = {
  projectId: string;
  iterationId: string;
};
export async function getIterationCapacities({
  projectId,
  iterationId,
}: GetIterationCapacitiesProps) {
  return fetchAzure(`/work/iterations/${iterationId}/iterationcapacities`, {
    projectId,
  }).then(
    (res: {
      teams: [
        {
          teamId: string;
          teamCapacityPerDay: number;
          teamTotalDaysOff: number;
        }
      ];
      totalIterationCapacityPerDay: number;
      totalIterationDaysOff: number;
    }) => res
  );
}
