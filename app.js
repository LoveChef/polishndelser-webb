const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const Post = require('./models/post.js');
const User = require('./models/user.js');


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
