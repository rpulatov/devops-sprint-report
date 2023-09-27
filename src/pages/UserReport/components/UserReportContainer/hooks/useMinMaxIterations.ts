import React from "react";
import { IterationAcrossProjects } from "./useUserReport";

export function useMinMaxIterations(iterations: IterationAcrossProjects[]) {
  return React.useMemo(() => {
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
}
