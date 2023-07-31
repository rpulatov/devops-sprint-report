import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();
    return (
        <>
            <button onClick={() => navigate('/devops-sprint-report/report')}>Отчет</button>
            <br />
            <button onClick={() => navigate('/devops-sprint-report/timeline')}>Таймлайн</button>
        </>
    );
}

export default Home;