import React from "react"

import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner"

import "./Loader.css"

export function Loader() {
  return (
    <div className="user-report-loader">
      <span>Подготовка данных...</span>
      <Spinner size={SpinnerSize.large} />
    </div>
  )
}
