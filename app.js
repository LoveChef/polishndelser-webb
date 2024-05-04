const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Post = require('./models/post.js');
const User = require('./models/user.js');
const router = express.Router();


const app = express();

// Connect to MongoDB database
mongoose.connect('mongodb+srv://love:love@energidryck.vves83k.mongodb.net/?retryWrites=true&w=majority&appName=Energidryck', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Ansluten till MongoDB'))
  .catch(err => console.error('Kunde inte ansluta till MongoDB', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.render('login', { error: 'Felaktig e-postadress.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.render('login', { error: 'Felaktigt lösenord.' });

    // User authenticated, handle success (e.g., redirect to profile)
    res.redirect('/posts'); // Replace with your desired route after login

  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Ett fel uppstod.' });
  }
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/upload', (req, res) => {
  res.render('upload');
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Ange mappen där du vill spara bilderna
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Använd ett unikt filnamn för att undvika kollisioner
  }
});

const upload = multer();

// Hantera POST-begäran för att ladda upp en bild
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Skapa en ny post baserad på det som skickats från formuläret
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      image: {
        data: req.file.buffer, // Binär data för den uppladdade bilden
        contentType: req.file.mimetype // Typ av fil
      }
    });

    // Spara den nya posten i databasen
    await newPost.save();

    // Redirect användaren någonstans efter att posten har sparats, till exempel till startsidan
    res.redirect('/');

  } catch (error) {
    console.error('Error uploading post:', error);
    // Hantera fel här, till exempel genom att rendera en felmeddelandesida
    res.render('error', { error: 'Error uploading post' });
  }
});

app.use('/', router);

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Ett fel uppstod vid registrering.' });
  }
});

app.get('/posts', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: 'desc' });
    res.render('posts', { posts });
  });
  
  app.post('/posts', async (req, res) => {
    const { title, content, author } = req.body;
    const newPost = new Post({
      title,
      content,
      author,
      createdAt: new Date()
    });
    await newPost.save();
    res.redirect('/posts');
  });

  // Lägg till en ny route för admin-sidan
app.get('/admin-login', (req, res) => {
  res.render('admin-login');
});

// Implementera inloggning för admin-sidan
app.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Kontrollera användarnamn och lösenord
    if (username === 'admin' && password === 'admin') {
      // Om inloggningen är framgångsrik, skicka användaren till admin-panelen
      res.redirect('/admin-panel');
    } else {
      // Om inloggningen misslyckas, rendera admin-login-sidan med ett felmeddelande
      res.render('admin-login', { error: 'Felaktigt användarnamn eller lösenord.' });
    }
  } catch (err) {
    console.error(err);
    res.render('admin-login', { error: 'Ett fel uppstod.' });
  }
});

// Skapa en admin-panel där administratören kan redigera inlägg
app.get('/admin-panel', async (req, res) => {
  try {
    // Hämta alla inlägg från databasen
    const posts = await Post.find().sort({ createdAt: 'desc' });
    res.render('admin-panel', { posts });
  } catch (err) {
    console.error(err);
    res.render('admin-panel', { error: 'Ett fel uppstod.' });
  }
});

// Implementera funktionen för att redigera inlägg
app.post('/admin-panel/edit-post/:id', async (req, res) => {
  const postId = req.params.id;
  const { title, content } = req.body;

  try {
    // Uppdatera inlägget i databasen med de nya uppgifterna
    await Post.findByIdAndUpdate(postId, { title, content });
    res.redirect('/admin-panel');
  } catch (err) {
    console.error(err);
    res.render('admin-panel', { error: 'Ett fel uppstod vid redigering av inlägget.' });
  }
});


// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servern är igång på port ${PORT}`));
