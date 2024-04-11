const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.get('/', async (req, res) => {
  try {
    const response = await fetch('https://polisen.se/api/events');
    const eventsData = await response.json();

    res.render('index', { events: eventsData });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).send('Internal Server Error');
  }
});

// No need for a separate '/events' route

app.use((req, res, next) => {
  res.status(404).send('<h1>Page not found</h1>');
});

const port = 3000;
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
