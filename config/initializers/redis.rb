require 'csv'
require 'byebug'
$redis = Redis.new(:host => 'localhost', :port => 6379)
# host = "ec2-184-73-182-113.compute-1.amazonaws.com"
# port = 12229
# password = "pb56s1fjj1147takjkahe3r4n38"
#$redis = Redis.new(:host => host, :port => port, :password => password)

$redis.flushdb

def load_data()
  movies_csv = File.read('config/ml-data/knn-5k-users/movies.csv')
  csv = CSV.parse(movies_csv, :headers => true)
  movies = Hash.new
  csv.each do |row|
    id = row["movieId"].to_i
    title = row["title"]
    year = row["year"].to_i
    movies[id] = {title: title, year: year}
  end
  users = load_movie_ratings_from_users(movies)
  compute_avg_ratings(movies)
  load_imdb_id(movies)
  return [movies, users]
end

def load_movie_ratings_from_users(movies)
  ratings_csv = File.read('config/ml-data/knn-5k-users/ratings.csv')
  csv = CSV.parse(ratings_csv, :headers => true)
  users = Hash.new
  csv.each do |row|
    # Parse data from csv file
    user_id = row["userId"].to_i
    movie_id = row["movieId"].to_i
    rating = row["rating"].to_f
    # Append ratings to movie
    if movies[movie_id][:ratings]
      movies[movie_id][:ratings] << rating
      movies[movie_id][:viewers] << user_id
    else
      movies[movie_id][:ratings] = [rating]
      movies[movie_id][:viewers] = [user_id]
    end
    # Record user rating to users
    if users[user_id]
      users[user_id][movie_id] = rating
    else
      users[user_id] = {movie_id => rating}
    end
  end
  return users
end

def load_imdb_id(movies)
  links_csv = File.read('config/ml-data/knn-5k-users/links.csv')
  csv = CSV.parse(links_csv, :headers => true)
  csv.each do |row|
    movie_id = row["movieId"].to_i
    imdb_id = row["imdbId"]
    tmdb_id = row["tmdbId"]
    movies[movie_id][:imdb_id] = imdb_id
    movies[movie_id][:tmdb_id] = tmdb_id
  end
end

def compute_avg_ratings(movies)
  movies.each do |id, value|
    if movies[id][:ratings]
      total_rating = 0
      movies[id][:ratings].each do |rating|
        total_rating += rating
      end
      movies[id][:avg_rating] = total_rating/movies[id][:ratings].length
    end
  end
  return nil
end

movies_map, users_map = load_data
# Cache movies_with_many_reviews in Redis
movies_with_many_reviews = {}
movie_ids = []
movies_map.each do |movie_id, info|
  movie_ids << movie_id
  if info[:viewers].size > 100
    movies_with_many_reviews[movie_id] = {
      title: info[:title],
      year: info[:year],
      viewers: info[:viewers],
      avg_rating: info[:avg_rating],
      imdb_id: info[:imdb_id]
    }
  end
end
# Caching in redis
$redis.set('movie_ids', movie_ids)
$redis.set('movies_with_many_reviews', movies_with_many_reviews)
$redis.set('movies', movies_map)
# $redis.set('users', users_map)

# Immediately free up memory and let garbage collector do its work
movie_ids, movies_with_many_reviews, movies_map = nil, nil, nil

# Cache the user objects in Rails
users = Hash.new
users_map.each do |user_id, user_movie_ratings|
  users[user_id] = User.new(user_id, user_movie_ratings)
end
Rails.cache.clear()
Rails.cache.write("users", users)
