import React from "react"

import "./TableContainer.css"

export type TableContainerProps = {
  htmlIdElement: string
  className: string
}
export function TableContainer({
  htmlIdElement,
  children,
  className,
}: React.PropsWithChildren<TableContainerProps>) {
  return (
    <table
      className={["table-container", className].join(" ")}
      id={htmlIdElement}
    >
      {children}
    </table>
  )
}
