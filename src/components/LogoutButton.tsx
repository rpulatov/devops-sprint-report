import React from "react"

import { Button } from "azure-devops-ui/Button"

import { isAuth, requestAuth, saveAuth, updateAuthToken } from "../api"

export function LogoutButton() {
  const [isAuthState, setIsAuthState] = React.useState(isAuth())
  return isAuthState ? (
    <Button
      iconProps={{ iconName: "Delete" }}
      onClick={() => {
        saveAuth("")
        updateAuthToken("")
        setIsAuthState(isAuth())
      }}
    >
      Забыть Personal Access Token Azure DevOps
    </Button>
  ) : (
    <Button
      iconProps={{ iconName: "Signin" }}
      onClick={() => {
        const PAT = requestAuth()
        if (PAT) {
          saveAuth(PAT)
          updateAuthToken(PAT)
          setIsAuthState(isAuth())
        }
      }}
    >
      Ввести Personal Access Token Azure DevOps
    </Button>
  )
}
