let PAT = import.meta.env.VITE_PAT;

const STORAGE_PARAM = '_t';

if (!PAT) PAT = sessionStorage.getItem(STORAGE_PARAM);
if (!PAT) PAT = prompt('Введите Personal Access Token Azure DevOps');

sessionStorage.setItem(STORAGE_PARAM, PAT);

const TOKEN = btoa(`${PAT}:${PAT}`);
const API_URL = 'https://dev.azure.com';
const ORG_NAME = 'solution-factory';

export function fetchAzure(
  url: string,
  options?: {
    projectId?: string;
    teamId?: string;
    parameters?: { [key: string | number]: string };
    method?: 'GET' | 'POST';
    body?: BodyInit;
  }
) {
  const { projectId, teamId, method = 'GET', body } = options ?? {};

  const params = new URLSearchParams([['api-version', '7.0']]);
  if (options?.parameters) {
    for (const param in options?.parameters) {
      params.append(param, options?.parameters[param]);
    }
  }

  return fetch(
    `${API_URL}/${ORG_NAME}/${projectId ? projectId + '/' : ''}${
      teamId ? teamId + '/' : ''
    }_apis${url}?${params.toString()}`,
    {
      method,
      headers: new Headers({
        Authorization: `Basic ${TOKEN}`,
        'Content-Type': 'application/json',
      }),
      body,
    }
  ).then((res) => res.json());
}
