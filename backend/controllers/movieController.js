const Movie = require('../models/movie');

// 1. Get all movies
const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movies' });
  }
};

// 2. Add a new movie
const addMovie = async (req, res) => {
  try {
    const newMovie = new Movie({
      title: req.body.title,
      genre: req.body.genre,
      releaseYear: req.body.releaseYear,
      status: req.body.status
    });

    const savedMovie = await newMovie.save();
    res.json(savedMovie);
  } catch (error) {
    res.status(400).json({ message: 'Error saving movie' });
  }
};

// 3. Update movie status
const updateStatus = async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updatedMovie);
  } catch (error) {
    res.status(400).json({ message: 'Error updating status' });
  }
};

module.exports = {
  getMovies,
  addMovie,
  updateStatus
};