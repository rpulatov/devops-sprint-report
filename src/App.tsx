import React, { useState } from 'react';

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
import { DataLayer } from './components/DataLayer';
import { NotificationLayer } from './components/NotificationLayer';

function App() {
  const [currentProject, setCurrentProject] =
    useState<TeamProjectReference | null>(null);

  const [currentIteration, setCurrentIteration] =
    useState<TeamSettingsIteration | null>(null);

  const [currentTeam, setCurrentTeam] = useState<WebApiTeam | null>(null);

  return (
    <div
      style={{
        padding: 20,
        backgroundColor: 'rgb(248, 248, 248)',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }}
    >
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
        </>
      ) : null}

      <p>
        <span>Наименование проекта: {currentProject?.name}</span>
      </p>
      <p>
        <span>Спринт: {currentIteration?.name}</span>
      </p>
      <p>
        <span>
          C:{' '}
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
        <DataLayer
          projectId={currentProject.id}
          teamId={currentTeam.id}
          iteration={currentIteration}
        />
      ) : null}
      <NotificationLayer />
    </div>
  );
}

export default App;
