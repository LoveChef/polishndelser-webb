const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: {
    data: Buffer, // Binär data för bilden
    contentType: String // Typ av fil (t.ex. image/png, image/jpeg etc.)
  }
});

module.exports = mongoose.model('Post', postSchema);
