const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  releaseYear: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Yet to watch', 'Already watching', 'Watched']
  }
});

module.exports = mongoose.model('Movie', movieSchema);