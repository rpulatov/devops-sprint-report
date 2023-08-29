import { useNavigate } from "react-router-dom";

import "./Home.css";
import { LogoutButton } from "../../components/LogoutButton";

function Home() {
  const navigate = useNavigate();
  return (
    <div className="homepage">
      <span className="homepage_title">Azure devops extensions</span>
      <button className="homepage_link" onClick={() => navigate("/report")}>
        Отчет план/факт по спринту
      </button>
      <button className="homepage_link" onClick={() => navigate("/timeline")}>
        Таймлайн по Work Item
      </button>
      <hr />
      <LogoutButton />
    </div>
  );
}

export default Home;
