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

const upload = multer({ storage: storage });

// Hantera POST-begäran för att ladda upp en bild
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Skapa en ny post baserad på det som skickats från formuläret
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      image: req.file.filename // Sparar filnamnet för den uppladdade bilden i databasen
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

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servern är igång på port ${PORT}`));
