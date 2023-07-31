import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();
    return (
        <>
            <button onClick={() => navigate('/report')}>Отчет</button>
            <br />
            <button onClick={() => navigate('/timeline')}>Таймлайн</button>
        </>
    );
}

export default Home;