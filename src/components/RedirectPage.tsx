import React, { useEffect } from "react"

import { useNavigate } from "react-router-dom"

import { DEFAULT_ORG_NAME } from "../api"

export function RedirectPage({ children }: React.PropsWithChildren<{}>) {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(`/${DEFAULT_ORG_NAME}`, { replace: true })
  }, [])
  return <>{children}</>
}
