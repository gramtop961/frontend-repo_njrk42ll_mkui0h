import { useState } from 'react';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';

function App(){
  const [started, setStarted] = useState(false);

  return (
    <div className="font-sans">
      {!started ? (
        <Hero onStart={()=>setStarted(true)} />
      ) : (
        <Dashboard />
      )}
    </div>
  );
}

export default App;
