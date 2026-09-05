const express = require('express');
const router = express.Router();
const { getMovies, addMovie, updateStatus } = require('../controllers/movieController');

// Get all movies
router.get('/', getMovies);

// Add a new movie
router.post('/', addMovie);

// Update status of a movie
router.put('/:id/status', updateStatus);

module.exports = router;