import React from "react";
import { isAuth, requestAuth, saveAuth, updateAuthToken } from "../api";

export function LogoutButton() {
  const [isAuthState,setIsAuthState] = React.useState(isAuth())
  return isAuthState ? (
    <button
      onClick={() => {
        saveAuth("");
        updateAuthToken("");
        setIsAuthState(isAuth())
      }}
    >
      Забыть Personal Access Token Azure DevOps
    </button>
  ) : (
    <button
      onClick={() => {
        const PAT = requestAuth();
        if (PAT) {
          saveAuth(PAT);
          updateAuthToken(PAT);
          setIsAuthState(isAuth())
        }
      }}
    >
      Ввести Personal Access Token Azure DevOps
    </button>
  );
}
