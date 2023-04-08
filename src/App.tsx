import React, { useCallback, useState } from 'react';

import { Page } from 'azure-devops-ui/Page';
import { Card } from 'azure-devops-ui/Card';

import './App.css';

import { SelectProject } from './components/SelectProject';
import {
  TeamProjectReference,
  WebApiTeam,
} from 'azure-devops-extension-api/Core';
import { SelectIteration } from './components/SelectIteration';
import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';
import { SelectTeam } from './components/SelectTeams';
import { Container } from './components/Container';
import { NotificationLayer } from './components/NotificationLayer';
import { TypeReport } from './types/report';

function App() {
  const [currentProject, setCurrentProject] =
    useState<TeamProjectReference | null>(null);

  const [currentIteration, setCurrentIteration] =
    useState<TeamSettingsIteration | null>(null);

  const [currentTeam, setCurrentTeam] = useState<WebApiTeam | null>(null);
  const [typeReport, setTypeReport] = useState<TypeReport>(
    TypeReport.SprintPlan
  );

  const onChangeReport = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setTypeReport(e.target.value as TypeReport),
    []
  );

  return (
    <div className="mainPage">
      <SelectProject
        onSelect={(data) => {
          setCurrentIteration(null);
          setCurrentTeam(null);
          setCurrentProject(data);
        }}
      />
      {currentProject ? (
        <>
          <SelectIteration
            projectId={currentProject.id}
            onSelect={setCurrentIteration}
          />
          <SelectTeam projectId={currentProject.id} onSelect={setCurrentTeam} />
          <select onChange={onChangeReport}>
            <option value={TypeReport.SprintPlan}>План спринта</option>
            <option value={TypeReport.SprintResult}>Результат спринта</option>
          </select>
        </>
      ) : null}

      <p>
        <span>Наименование проекта: {currentProject?.name}</span>
      </p>
      <p>
        <span>
          {typeReport === TypeReport.SprintPlan
            ? 'План спринта:'
            : 'Результат спринта:'}{' '}
          {currentIteration?.name}
        </span>
      </p>
      <p>
        <span>
          Период с:{' '}
          {currentIteration?.attributes?.startDate
            ? new Date(
                currentIteration?.attributes?.startDate
              ).toLocaleDateString('ru-RU')
            : ''}{' '}
          по{' '}
          {currentIteration?.attributes?.finishDate
            ? new Date(
                currentIteration?.attributes?.finishDate
              ).toLocaleDateString('ru-RU')
            : ''}
        </span>
      </p>
      {currentProject && currentTeam && currentIteration ? (
        <Container
          projectId={currentProject.id}
          teamId={currentTeam.id}
          iteration={currentIteration}
          typeReport={typeReport}
        />
      ) : null}
      <NotificationLayer />
    </div>
  );
}

export default App;
