import * as azdev from 'azure-devops-node-api';

const PAT = import.meta.env.VITE_PAT;
const API_URL = 'https://dev.azure.com';
const ORG_NAME = 'solution-factory';

let authHandler = azdev.getPersonalAccessTokenHandler(PAT);
export const client = new azdev.WebApi(`${API_URL}/${ORG_NAME}`, authHandler);
