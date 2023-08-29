import React from "react";

import "./Header.css";
import { Link } from "react-router-dom";

type HeaderPrors = {};
export default function Header({
  children,
}: React.PropsWithChildren<HeaderPrors>) {
  return (
    <div className="header">
      <div className="header_breadcrumbs">
        <Link to="/">/Главная</Link>
      </div>
      <div className="header_content">{children}</div>
    </div>
  );
}
