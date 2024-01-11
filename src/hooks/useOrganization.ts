import React from "react"

import { useParams } from "react-router-dom"

import { DEFAULT_ORG_NAME } from "../api"

export function useOrganization() {
  const { organization = DEFAULT_ORG_NAME } = useParams<{
    organization: string
  }>()

  return { organization }
}
