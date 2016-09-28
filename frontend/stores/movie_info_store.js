"use strict";

const Dispatcher = require('../dispatcher/dispatcher');
const MovieConstants = require('../constants/movie_constants');
const Store = require('flux/utils').Store;
const MovieInfoStore = new Store(Dispatcher);

let _movieInfo = {};

MovieInfoStore.__onDispatch = payload => {
  switch (payload.actionType) {
    case MovieConstants.MOVIE_INFO_RECEIVED:
    MovieInfoStore.receiveMovieInfo(payload.movie);
    MovieInfoStore.__emitChange();
    break;
  }
};

MovieInfoStore.getMovieInfo = function(imdbId){
  return _movieInfo[imdbId];
};

MovieInfoStore.receiveMovieInfo = function(movie) {
  _movieInfo[movie.imdbID] = movie;
};

module.exports = MovieInfoStore;