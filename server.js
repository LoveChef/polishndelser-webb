const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('cross-fetch'); // Import node-fetch

const app = express();

let eventsData = null; // Store fetched events data

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

const mongoose = require('mongoose');

// ... other imports

const connectDb = async () => {
  try {
    await mongoose.connect('mongodb+srv://love:love@energidryck.vves83k.mongodb.net/?retryWrites=true&w=majority&appName=Energidryck', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit the application on error
  }
};

// Call connectDb function to connect to MongoDB before starting the server
connectDb();

// ... other server logic


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
  }
})();

async function fetchMunicipalities() {
  try {
    // Anslut till rätt samling i MongoDB-databasen
    const db = mongoose.connection.db;
    const collection = db.collection('kommuner');

    // Hämta alla dokument från samlingen och returnera en array av kommunnamn
    const municipalities = await collection.find().toArray();
    return municipalities.map(municipality => municipality.name);
  } catch (error) {
    console.error('Error fetching municipalities:', error);
    return [];
  }
}


// ...

(async () => {
  // ... existing event fetching logic
  const municipalities = await fetchMunicipalities();
  // ... use municipalities data for sorting or displaying options
})();


app.get('/', async (req, res) => {
  try {
    const municipalities = await fetchMunicipalities();
    res.render('index', { events: eventsData, showEvents: true, municipalities });
  } catch (error) {
    console.error('Error fetching municipalities:', error);
    res.status(500).send('Internal Server Error');
  }
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

// server.js

app.post('/upload-municipalities', async (req, res) => {
  // Access uploaded municipalities from request body
  const { municipalities } = req.body;

  try {
    // Kontrollera om municipalities är en sträng, om det är så, konvertera till en array
    const municipalityArray = Array.isArray(municipalities) ? municipalities : [municipalities];

    // Anslut till rätt databas och samling
    const db = mongoose.connection.db;
    const collection = db.collection('kommuner');

    // Insertera kommunerna i rätt samling
    await collection.insertMany(municipalityArray.map(name => ({ name })));

    res.json({ message: 'Municipalities uploaded successfully!' });
  } catch (error) {
    console.error('Error uploading municipalities:', error);
    res.status(500).json({ message: 'Error uploading municipalities' });
  }
});




app.use((req, res, next) => {
  res.status(404).send('<h1>Page not found</h1>');
});

const port = 3000;
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));