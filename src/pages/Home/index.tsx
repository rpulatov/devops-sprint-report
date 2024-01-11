import { useNavigate } from "react-router-dom"

import { Button } from "azure-devops-ui/Button"

import { LogoutButton } from "../../components/LogoutButton"
import "./Home.css"

function Home() {
  const navigate = useNavigate()
  return (
    <div className="homepage">
      <span className="homepage_title">Azure devops extensions</span>
      <Button
        className="homepage_link"
        primary
        onClick={() => navigate("/report")}
        text="Отчет план/факт по спринту"
      />

      <Button
        className="homepage_link"
        primary
        onClick={() => navigate("/user-report")}
        text="Отчет по сотруднику"
      />
      <Button
        className="homepage_link"
        primary
        onClick={() => navigate("/timeline")}
        text="Таймлайн по Work Item"
      />
      <hr />
      <LogoutButton />
    </div>
  )
}

export default Home
