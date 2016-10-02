const React = require('react');
const MovieRatingStore = require('../stores/movie_rating_store');
const MovieRatingActions = require('../actions/movie_rating_actions');
const MovieStore = require('../stores/movie_store');
const MovieActions = require('../actions/movie_actions');
const MovieItem = require('./movie_item');
const Cookies = require('js-cookie');
const Button = require('react-bootstrap').Button;

const RatedIndex = React.createClass({
  getInitialState() {
    return { ratedMovies: {} };
  },

  componentDidMount() {
    this.movieRatingStoreListener = MovieRatingStore.addListener(this.setRatedMovies);
    this.movieStoreListener = MovieStore.addListener(this.setRatedMovies);
  },

  componentWillUnmount(){
    this.movieRatingStoreListener.remove();
    this.movieStoreListener.remove();
  },

  setRatedMovies() {
    let ratings = MovieRatingStore.getRatings();
    let ratedMovies = {};
    Object.keys(ratings).forEach((movieId) => {
      if (MovieStore.findMovie(movieId)) {
        ratedMovies[movieId] = MovieStore.findMovie(movieId);
        ratedMovies[movieId]["rating"] = ratings[movieId];
      }
    });
    this.setState({ratedMovies: ratedMovies});
  },

  renderRatedMovies() {
    let movies = this.state.ratedMovies;
    return Object.keys(movies).map((movieId) => {
      let movie = movies[movieId];
      return (
        <MovieItem
          key={movie.id}
          movieId={movie.id}
          imdbId={movie.imdbId}
          rated={true}
          rating={movie.rating}
          />
      );
    });
  },

  deleteCookies() {
    MovieRatingActions.clearRatingHistoryFromStore({});
    this.setState({ ratedMovies: {} });
    Cookies.set("consilium, {}");
    // set cookies to empty first in case the user never rated any movies but decide to clear their cookies anyway.
    Cookies.remove("consilium");
  },

  render() {
    return (
      <div>
        <div className="rated-header"><h1>Rated Movies</h1>
        <Button
          bsSize="xsmall"
          id="rated-header-button"
          className="react-buttons"
          onClick={this.deleteCookies}
          bsStyle="primary">
          Delete My History
        </Button>
        </div>
        <div className="movie-index">
          {this.renderRatedMovies()}
        </div>
      </div>
    );
  }

});

module.exports = RatedIndex;
