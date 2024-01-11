import React from "react"

import { useNavigate } from "react-router-dom"

import { Header as HeaderAzure, TitleSize } from "azure-devops-ui/Header"

import { useOrganization } from "../hooks/useOrganization"

type HeaderPrors = { title?: string }
export default function Header({
  title,
}: React.PropsWithChildren<HeaderPrors>) {
  const navigate = useNavigate()
  const { organization } = useOrganization()
  return (
    <HeaderAzure
      title={title}
      titleSize={TitleSize.Large}
      separator
      backButtonProps={{
        onClick: () => navigate(`/${organization}`),
      }}
    />
  )
}
