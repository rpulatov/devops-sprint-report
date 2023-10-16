import React from "react"

import { TableColumnProps, TableColumnType } from "./TableColumn"
import { TableContainer } from "./TableContainer"
import { TableFooter } from "./TableFooter"
import { TableHeader } from "./TableHeader"
import { TableRow } from "./TableRow"

type TableDefaultDataType = {
  [key: string]: string | number | undefined | null | boolean
}

type TableColumnsItem<T> = TableColumnProps<T> & { key: string }

export type TableProps<T extends TableDefaultDataType> = {
  keyId?: string
  htmlIdElement: string
  data: Array<T>
  children:
    | React.ReactElement<TableColumnProps<T>>
    | null
    | Array<React.ReactElement<TableColumnProps<T>> | null>
  containerClassName?: string
}
export function Table<T extends TableDefaultDataType>({
  keyId = "id",
  htmlIdElement,
  children,
  data,
  containerClassName = "",
}: TableProps<T>) {
  const columns = React.useMemo(() => {
    const res: Array<TableColumnsItem<T>> = []
    React.Children.forEach(children, (el, index) => {
      if (el) {
        if (el.props.children) {
          if (Array.isArray(el.props.children)) {
            el.props.children.forEach(el2 => {
              res.push({ key: el2.props.name + el2.props.title, ...el2.props })
            })
          } else
            res.push({
              key: el.props.children.props.name + el.props.children.props.title,
              ...el.props.children.props,
            })
        } else res.push({ key: el.props.name + el.props.title, ...el.props })
      }
    })
    return res
  }, [children])

  const getValueFormat = React.useCallback(
    (item: T, key: string, type?: TableColumnType) => {
      const value = item[key]
      if (!value) return value
      if (type === "number") {
        return Number(value).toFixed(1)
      } else return value
    },
    []
  )
  return (
    <TableContainer
      htmlIdElement={htmlIdElement}
      className={containerClassName}
    >
      <TableHeader>
        <TableRow>
          {columns.map(col => (
            <th key={col.key} className={col.className}>
              {col.title}
            </th>
          ))}
        </TableRow>
      </TableHeader>
      <tbody>
        {data.map((item, i) => (
          <TableRow key={String(getValueFormat(item, keyId)) || i}>
            {columns.map(col => (
              <td key={col.key} className={col.className}>
                {col.render
                  ? col.render(item)
                  : col.name
                  ? getValueFormat(item, col.name, col.type)
                  : ""}
              </td>
            ))}
          </TableRow>
        ))}
      </tbody>
      {columns.findIndex(item => !!item.renderFooter) >= 0 ? (
        <TableFooter>
          <TableRow>
            {columns.map(col => (
              <td key={col.key} className={col.className}>
                {col.renderFooter ? col.renderFooter() : ""}
              </td>
            ))}
          </TableRow>
        </TableFooter>
      ) : null}
    </TableContainer>
  )
}
