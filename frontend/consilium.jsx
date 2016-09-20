const React = require('react');
const ReactDOM = require('react-dom');
const Router = require('react-router').Router;
const Route = require('react-router').Route;
const IndexRoute = require('react-router').IndexRoute;
const hashHistory = require('react-router').hashHistory;

const MovieRecommender = require('./components/movie_recommender');
const EmotionDetection = require('./components/emotion_detection');
const About = require('./components/about');
const NavigationBar = require('./components/navigation_bar');
// Graph may be useful to us in the future, but now, keep it lean
const Graph = require('./deprecated_components/graph');


const MovieActions = require('./actions/movie_actions');
window.MovieActions = MovieActions;
const MovieStore = require('./stores/movie_store');
window.MovieStore = MovieStore;


const Consilium = React.createClass({
  render: function() {
    return (
      <div>
        <NavigationBar/>
        {this.props.children}
      </div>
    );
  }
});

const routes = (
  <Router history={hashHistory}>
    <Route path="/" component={Consilium}>
      <IndexRoute component={MovieRecommender}/>
      <Route path="/about" component={About}/>
      <Route path="/graph" component={Graph}/>
    </Route>
  </Router>
);

document.addEventListener("DOMContentLoaded", function(){
  ReactDOM.render(routes, document.getElementById("application"));
});
