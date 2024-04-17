const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fetch = require('cross-fetch'); // Import node-fetch

const app = express();

let eventsData = null;
let municipalities = null

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

mongoose.connect('mongodb+srv://love:love@energidryck.vves83k.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));



// Fetch events on server startup (optional)
(async () => {
  try {
    const response = await fetch('https://polisen.se/api/events');
    eventsData = await response.json();

    // Modify eventsData to extract data, hide timezone, add location name, emojis, and icons
    eventsData.forEach(event => {
      const nameParts = event.name.split(',');
      event.name = nameParts.length > 1 ? nameParts[1].trim() : event.name;

      if (event.datetime) {
        const dateTimeParts = event.datetime.split(' ');
        event.datetime = `${dateTimeParts[0]} ${dateTimeParts[1]}`; // Keep date and time
      }

      if (event.location && event.location.name) {
        event.locationName = event.location.name; 
      }

      switch (event.type) {
        case 'Rån':
          event.emoji = '🔫';
          break;
        case 'Trafikkontroll':
          event.emoji = '🚓';
          break;
        case 'Stöld':
          event.emoji = '🕶️';
          break;
        case 'Arbetsplatsolycka':
          event.emoji = '🚧';
          break;
        case 'Rattfylleri':
          event.emoji = '🍻';
          break;
        case 'Sammanfattning natt':
          event.emoji = '📝';
          break;
        case 'Skadegörelse':
          event.emoji = '🚯';
          break;
        case 'Trafikolycka':
          event.emoji = '🚗';
          break;
        case 'Övrigt':
          event.emoji = '⚒️';
          break;
        case 'Mord':
          event.emoji = '🩸';
          break;
        case 'Slagsmål':
          event.emoji = '🛡️';
          break;
        case 'Brand':
          event.emoji = '🔥';
          break;
        case 'Inbrott':
          event.emoji = '🔒';
          break;
        case 'Misshandel':
          event.emoji = '🤛';
          break;
        case 'Vapenlagen':
          event.emoji = '🔫';
          break;
        case 'Skottlossning':
          event.emoji = '🔫';
          break;
        default:
          event.emoji = '🚨';
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
  }
})();



(async () => {
  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    const collection = db.collection('municipalities');
    municipalities = await collection.find().toArray();
    client.close();
  } catch (error) {
    console.error('Error fetching municipalities:', error);
  }
})();

app.get('/', async (req, res) => {
  res.render('index', { events: eventsData, municipalities: municipalities, showEvents: false });
});

app.post('/show-events', async (req, res) => {
  const selectedMunicipality = req.body.municipality;
  
  // Filter events based on selected municipality
  const filteredEvents = eventsData.filter(event => event.locationName === selectedMunicipality);
  
  res.render('index', { events: filteredEvents, municipalities: municipalities, showEvents: true });
});

app.get('/', async (req, res) => {
  res.render('index', { events: eventsData, showEvents: false }); // Initially hide events
});

app.post('/show-events', async (req, res) => { // Handle button click
  if (!eventsData) { // Fetch events if not already done
    try {
      const response = await fetch('https://polisen.se/api/events');
      eventsData = await response.json();

      // Modify eventsData to extract data, hide timezone, add location name, emojis, and icons (within the if block)
      eventsData.forEach(event => {
        const nameParts = event.name.split(',');
        event.name = nameParts.length > 1 ? nameParts[1].trim() : event.name;

        if (event.datetime) {
          const dateTimeParts = event.datetime.split(' ');
          event.datetime = `${dateTimeParts[0]} ${dateTimeParts[1]}`; // Keep date and time
        }

        if (event.location && event.location.name) {
          event.locationName = event.location.name; // Add "locationName" property
        }

        // Add emoji based on event type (Unicode characters)
        switch (event.type) {
          case 'Rån':
            event.emoji = '🔫';
            break;
          case 'Trafikkontroll':
            event.emoji = '🚓';
            break;
          case 'Stöld':
            event.emoji = '🕶️';
            break;
          case 'Arbetsplatsolycka':
            event.emoji = '🚧';
            break;
          case 'Rattfylleri':
            event.emoji = '🍻';
            break;
          case 'Sammanfattning natt':
            event.emoji = '📝';
            break;
          case 'Skadegörelse':
            event.emoji = '🚯';
            break;
          case 'Trafikolycka':
            event.emoji = '🚗';
            break;
          case 'Övrigt':
            event.emoji = '⚒️';
            break;
          case 'Mord':
            event.emoji = '🩸';
            break;
          case 'Slagsmål':
            event.emoji = '🛡️';
            break;
          case 'Brand':
            event.emoji = '🔥';
            break;
          case 'Inbrott':
            event.emoji = '🔒';
            break;
          case 'Misshandel':
            event.emoji = '🤛';
            break;
          case 'Vapenlagen':
            event.emoji = '🔫';
            break;
          case 'Skottlossning':
            event.emoji = '🔫';
            break;
          default:
            event.emoji = '🚨';
        }
      });
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
