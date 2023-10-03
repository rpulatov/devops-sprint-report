import React from "react"

import "./TableFooter.css"

export type TableFooterProps = {}
export function TableFooter({
  children,
}: React.PropsWithChildren<TableFooterProps>) {
  return <tfoot className="table-footer">{children}</tfoot>
}
