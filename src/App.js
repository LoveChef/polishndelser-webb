import logo from './logo.png';
import './App.css';
import FilterComponent from './FilterComponent'; // Eller rätt sökväg
import EventListComponent from './EventListComponent';

import { useState, useEffect } from 'react';

function App() {
  const [today, setToday] = useState(new Date());
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Alla kommuner');
  const [eventsData, setEventsData] = useState([]);

  useEffect(() => {
    fetch('polisen.se/api/events')
      .then((response) => response.json())
      .then((data) => setEventsData(data));
  }, []);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  const handleButtonClick = () => {
    setShowFilter(true);
  };

  const filteredEvents = eventsData.filter((event) => {
    // Filtrering baserat på selectedFilter
    if (selectedFilter === 'Alla kommuner') {
      return true;
    } else {
      return event.municipality === selectedFilter;
    }
  });
  const options = { weekday: 'long' }; // Ange options för att visa veckodag
  const weekday = today.toLocaleDateString('sv-SE', options); // Visa veckodagen på svenska

  return (
    <><div className="App">
      <header className="App-header">
        <p id="title">Polishändelser</p>
        <img id="topimg" src={logo}></img>
      </header>

      <button class="button-events">
        <span onClick={handleButtonClick}>Händelser</span>
      </button>
      {showFilter && (
          <FilterComponent
            selectedFilter={selectedFilter}
            onFilterChange={handleFilterChange}
          />
        )}
        <EventListComponent events={filteredEvents} />
    </div>
    <footer className="footer">
      <p id="title-p">Love Ekelöw</p>
      <p>All rights reserved</p>
      <p>Ha en trevlig {weekday}!</p>
      <img src={logo} id="bottomimg"></img>
    </footer></>
    
  );
}

export default App;
