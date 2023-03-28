import React from 'react';

import './TableContainer.css';

export type TableContainerProps = {};
export function TableContainer({
  children,
}: React.PropsWithChildren<TableContainerProps>) {
  return <table className="table-container">{children}</table>;
}
