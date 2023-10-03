import React from "react"

import { useNavigate } from "react-router-dom"

import { Header as HeaderAzure, TitleSize } from "azure-devops-ui/Header"

type HeaderPrors = { title?: string }
export default function Header({
  title,
}: React.PropsWithChildren<HeaderPrors>) {
  const navigate = useNavigate()
  return (
    <HeaderAzure
      title={title}
      titleSize={TitleSize.Large}
      separator
      backButtonProps={{
        onClick: () => navigate("/"),
      }}
    />
  )
}
