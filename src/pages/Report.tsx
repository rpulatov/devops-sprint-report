import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import * as XLSX from 'xlsx';
import { SelectProject } from '../components/SelectProject';
import {
  TeamProjectReference,
  WebApiTeam,
} from 'azure-devops-extension-api/Core';
import { SelectIteration } from '../components/SelectIteration';
import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';
import { SelectTeam } from '../components/SelectTeams';
import { Container } from '../components/Container';
import { NotificationLayer } from '../components/NotificationLayer';
import { TypeReport } from '../types/report';

import './Report.css';
import { LogoutButton } from '../components/LogoutButton';

function Report() {
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

  const navigate = useNavigate();

  const exportToExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.table_to_sheet(
      document.querySelector('#sprint-title')
    );

    const ws11 = XLSX.utils.table_to_sheet(
      document.querySelector('#team-report')
    );

    const dataTeamReport = XLSX.utils.sheet_to_json<{ [key: string]: string }>(
      ws11,
      { header: 1, blankrows: false }
    );

    const aoaTeamReport = dataTeamReport.map(Object.values);

    XLSX.utils.sheet_add_aoa(ws1, aoaTeamReport, { origin: 5 });

    XLSX.utils.book_append_sheet(wb, ws1, 'Отчет по команде');

    const ws2 = XLSX.utils.table_to_sheet(
      document.querySelector('#user-story-report')
    );
    XLSX.utils.book_append_sheet(wb, ws2, 'User Story');

    const ws3 = XLSX.utils.table_to_sheet(
      document.querySelector('#feature-report')
    );
    XLSX.utils.book_append_sheet(wb, ws3, 'Feature');

    XLSX.writeFile(wb, 'sprint.xlsx');
  }, []);

  const colSpanTitleForTeamReport = 12;

  return (
    <div className="container">
      <div className="header">
        <div className="header-filter">
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
              <SelectTeam
                projectId={currentProject.id}
                onSelect={setCurrentTeam}
              />
              <select onChange={onChangeReport}>
                <option value={TypeReport.SprintPlan}>План спринта</option>
                <option value={TypeReport.SprintResult}>
                  Результат спринта
                </option>
              </select>
            </>
          ) : null}
        </div>
        <div>
          <button onClick={() => navigate('/devops-sprint-report/')}>На главную</button>
          <LogoutButton />
        </div>
      </div>

      <table id="sprint-title">
        <thead>
          <tr>
            <td>Наименование проекта:</td>
            <td colSpan={colSpanTitleForTeamReport}>{currentProject?.name}</td>
          </tr>
          <tr>
            <td>
              {typeReport === TypeReport.SprintPlan
                ? 'План спринта:'
                : 'Результат спринта:'}
            </td>
            <td colSpan={colSpanTitleForTeamReport}>
              {currentIteration?.name}
            </td>
          </tr>
          <tr>
            <td>Период:</td>
            <td colSpan={colSpanTitleForTeamReport}>
              {currentIteration?.attributes?.startDate
                ? new Date(
                    currentIteration?.attributes?.startDate
                  ).toLocaleDateString('ru-RU')
                : ''}{' '}
              {' - '}
              {currentIteration?.attributes?.finishDate
                ? new Date(
                    currentIteration?.attributes?.finishDate
                  ).toLocaleDateString('ru-RU')
                : ''}
            </td>
          </tr>
        </thead>
      </table>

      {currentProject && currentTeam && currentIteration ? (
        <>
          <p>
            <button onClick={exportToExcel}>Export to Excel</button>
          </p>
          <Container
            projectId={currentProject.id}
            teamId={currentTeam.id}
            iteration={currentIteration}
            typeReport={typeReport}
          />
        </>
      ) : null}
      <NotificationLayer />
    </div>
  );
}

export default Report;
