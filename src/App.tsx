import { useState } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';

import { useProjects } from './domains';

function App() {
  const { projects } = useProjects();

  console.log(projects);

  return <div className="App">{import.meta.env.VITE_TOKEN}</div>;
}

export default App;
