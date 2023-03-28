import React from 'react';

import './TableHeader.css';

export type TableHeaderProps = {};
export function TableHeader({
  children,
}: React.PropsWithChildren<TableHeaderProps>) {
  return <thead className="table-header">{children}</thead>;
}
