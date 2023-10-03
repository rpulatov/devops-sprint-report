let PAT = import.meta.env.VITE_PAT

if (!PAT) PAT = getPAT()
if (!PAT) PAT = requestAuth()
if (PAT) saveAuth(PAT)

let TOKEN = ""
const API_URL = "https://dev.azure.com"
const ORG_NAME = "solution-factory"

updateAuthToken(PAT)

function getPAT() {
  return localStorage.getItem("t")
}

export function isAuth() {
  return !!getPAT()
}

export function requestAuth() {
  return prompt("Введите Personal Access Token Azure DevOps")
}

export function saveAuth(PAT: string) {
  localStorage.setItem("t", PAT)
}

export function updateAuthToken(PAT: string) {
  TOKEN = btoa(`${PAT}:${PAT}`)
}

export function fetchAzure(
  url: string,
  options?: {
    projectId?: string
    teamId?: string
    parameters?: { [key: string | number]: string }
    method?: "GET" | "POST"
    body?: BodyInit
  }
) {
  const { projectId, teamId, method = "GET", body } = options ?? {}

  const params = new URLSearchParams([["api-version", "7.0"]])
  if (options?.parameters) {
    for (const param in options?.parameters) {
      params.append(param, options?.parameters[param])
    }
  }

  return fetch(
    `${API_URL}/${ORG_NAME}/${projectId ? projectId + "/" : ""}${
      teamId ? teamId + "/" : ""
    }_apis${url}?${params.toString()}`,
    {
      method,
      headers: new Headers({
        Authorization: `Basic ${TOKEN}`,
        "Content-Type": "application/json",
      }),
      body,
    }
  ).then(res => {
    return res.json().then(data => {
      if (res.status !== 200) return Promise.reject(new Error(data.message))
      return data
    })
  })
}

export async function fetchAzureRawUrl(
  url: string,
  options?: {
    parameters?: { [key: string | number]: string }
    method?: "GET" | "POST"
    body?: BodyInit
  }
) {
  const { method = "GET", body } = options ?? {}
  const params = new URLSearchParams([["api-version", "7.0"]])
  if (options?.parameters) {
    for (const param in options?.parameters) {
      params.append(param, options?.parameters[param])
    }
  }

  return fetch(url, {
    method,
    headers: new Headers({
      Authorization: `Basic ${TOKEN}`,
      "Content-Type": "application/json",
    }),
    body,
  }).then(res => {
    return res.json().then(data => {
      if (res.status !== 200) return Promise.reject(new Error(data.message))
      return data
    })
  })
}

export function buildAzureWebUrl(url: string) {
  return `${API_URL}/${ORG_NAME}/${url}`
}
