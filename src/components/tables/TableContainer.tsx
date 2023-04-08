import React from 'react';

import './TableContainer.css';

export type TableContainerProps = {
  htmlIdElement: string;
};
export function TableContainer({
  htmlIdElement,
  children,
}: React.PropsWithChildren<TableContainerProps>) {
  return (
    <table className="table-container" id={htmlIdElement}>
      {children}
    </table>
  );
}
