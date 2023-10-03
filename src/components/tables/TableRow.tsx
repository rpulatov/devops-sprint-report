import React from "react"

import "./TableRow.css"

export type TableRowProps = {}
export function TableRow({ children }: React.PropsWithChildren<TableRowProps>) {
  return <tr className="table-row">{children}</tr>
}
