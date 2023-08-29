import React from "react";

import "./NoMatch.css";
import { Link } from "react-router-dom";

export default function NoMatch() {
  return (
    <div className="no-match">
      <span>Нет такой страницы</span>
      <h1>404</h1>
      <Link to="/">На главную</Link>
    </div>
  );
}
