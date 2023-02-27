import React, { useState } from 'react';

import { Page } from 'azure-devops-ui/Page';
import { Card } from 'azure-devops-ui/Card';

import './App.css';

import { useProjects } from './domains';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { SelectProject } from './components/SelectProject';
import {
  TeamProjectReference,
  WebApiTeam,
} from 'azure-devops-extension-api/Core';
import { SelectIteration } from './components/SelectIteration';
import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';
import { SelectTeam } from './components/SelectTeams';

function App() {
  const [currentProject, setCurrentProject] =
    useState<TeamProjectReference | null>(null);

  const [currentIteration, setCurrentIteration] =
    useState<TeamSettingsIteration | null>(null);

  const [currentTeam, setCurrentTeam] = useState<WebApiTeam | null>(null);

  return (
    <Page className="main-page" orientation={0}>
      <SelectProject onSelect={setCurrentProject} />
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
    </Page>
  );
}

export default App;
