import logo from './logo.png';
import './App.css';

import { useState, useEffect } from 'react';

function App() {
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setToday(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const options = { weekday: 'long' }; // Ange options för att visa veckodag
  const weekday = today.toLocaleDateString('sv-SE', options); // Visa veckodagen på svenska

  return (
    <><div className="App">
      <header className="App-header">
        {/*<img src={logo} className="App-logo" alt="logo" />*/}
        <h1>Polishändelser</h1>
      </header>

      <button class="button-events">
        <span>Händelser</span>
      </button>
    </div>
    <footer className="footer">
      <p id="title-p">Love Ekelöw</p>
      <p>All rights reserved</p>
      <p>Ha en trevlig {weekday}!</p>
    </footer></>
    
  );
}

export default App;
