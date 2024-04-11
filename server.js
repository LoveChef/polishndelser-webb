const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('cross-fetch'); // Import node-fetch

const app = express();

let eventsData = null; // Store fetched events data

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

// Fetch events on server startup (optional)
(async () => {
  try {
    const response = await fetch('https://polisen.se/api/events');
    eventsData = await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
  }
})();

app.get('/', async (req, res) => {
  res.render('index', { events: eventsData, showEvents: false }); // Initially hide events
});

app.post('/show-events', async (req, res) => { // Handle button click
  if (!eventsData) { // Fetch events if not already done
    try {
      const response = await fetch('https://polisen.se/api/events');
      eventsData = await response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
      return res.status(500).send('Internal Server Error');
    }
  }
  res.render('index', { events: eventsData, showEvents: true }); // Show events now
});

app.use((req, res, next) => {
  res.status(404).send('<h1>Page not found</h1>');
});

const port = 3000;
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
