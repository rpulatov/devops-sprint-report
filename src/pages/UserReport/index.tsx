import React from "react";

import Header from "../../components/Header";
import { Page } from "azure-devops-ui/Page";

import { useProjects } from "../../hooks/useProjects";
import { getIterations } from "../../domains";
import { errorNotification } from "../../api/notificationObserver";

import "./UserReport.css";
import { Loader } from "./components/Loader";
import {
  IterationAcrossProjects,
  UserReportContainer,
} from "./components/UserReportContainer";
import { UserReportContent } from "./components/UserReportContent";

export const USER_REPORT_TITLE = "Отчет по сотруднику";

export default function UserReport() {
  const [loading, setLoading] = React.useState(true);

  const [iterations, setIterations] = React.useState<IterationAcrossProjects[]>(
    []
  );

  const { projects } = useProjects();

  React.useEffect(() => {
    if (!projects.length) return undefined;

    Promise.all(
      projects.map((project) => getIterations({ projectId: project.id }))
    )
      .then((res) => {
        const resultIterations = res.flatMap<IterationAcrossProjects>(
          (baseIterations, indexProject) =>
            baseIterations.map((baseIteration) => ({
              ...baseIteration,
              attributes: {
                startDate: new Date(baseIteration.attributes.startDate),
                finishDate: new Date(baseIteration.attributes.finishDate),
                timeFrame: baseIteration.attributes.timeFrame,
              },
              project: {
                id: projects[indexProject].id,
                name: projects[indexProject].name,
              },
            }))
        );
        setIterations(resultIterations);
      })
      .catch(errorNotification)
      .finally(() => setLoading(false));
  }, [projects]);

  return (
    <Page className="user-report">
      <Header title={USER_REPORT_TITLE} />
      {loading ? <Loader /> : null}
      {iterations.length > 0 ? (
        <UserReportContainer iterations={iterations} projects={projects}>
          <UserReportContent />
        </UserReportContainer>
      ) : null}
    </Page>
  );
}
