const PAT = import.meta.env.VITE_PAT;

console.log({ PAT });
const TOKEN = btoa(`${PAT}:${PAT}`);
const API_URL = 'https://dev.azure.com';
const ORG_NAME = 'solution-factory';

export function fetchAzure(
  url: string,
  options?: {
    projectId?: string;
    teamId?: string;
    parameters?: { [key: string]: string };
  }
) {
  const params = new URLSearchParams([['api-version', '7.0']]);
  if (options?.parameters) {
    for (const param in options?.parameters) {
      params.append(param, options?.parameters[param]);
    }
  }

  const projectId = options?.projectId ? options.projectId + '/' : '';
  const teamId = options?.teamId ? options.teamId + '/' : '';

  return fetch(
    `${API_URL}/${ORG_NAME}/${projectId}${teamId}_apis${url}?${params.toString()}`,
    {
      method: 'GET',
      headers: new Headers({ Authorization: `Basic ${TOKEN}` }),
    }
  ).then((res) => res.json());
}
