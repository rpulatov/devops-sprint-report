import React from "react"

import { Link } from "react-router-dom"

import "./NoMatch.css"

export default function NoMatch() {
  return (
    <div className="no-match">
      <span>Нет такой страницы</span>
      <h1>404</h1>
      <Link to="/">На главную</Link>
    </div>
  )
}
