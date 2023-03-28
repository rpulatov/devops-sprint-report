import React from 'react';

export type TableColumnType = 'number' | 'string';

export type TableColumnProps<T> = {
  name?: string;
  className?: string;
  title: string;
  render?: (item: T) => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  type?: TableColumnType;
  children?:
    | React.ReactElement<TableColumnProps<T>>
    | Array<React.ReactElement<TableColumnProps<T>>>;
};
export function TableColumn<T>(props: TableColumnProps<T>) {
  return <></>;
}
