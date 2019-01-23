/**
 * Global data source
 */
let movieData = [];
let movieDetail = {};
let castData = [];
let quotesData = [];
let integratedObject = {};

/**
 * Handle document input
 */
$(document).ready(() => {
    $('#search').on('submit', (e) => {
        let input = $('#searchInput').val();
        search(input);
        e.preventDefault();
    });
});

/**
 * Get the movie data from the tmdb api
 * @param {string} searchTerm 
 */
function search(searchTerm){
    axios.get('https://api.themoviedb.org/3/search/movie?api_key=' + tmdbApiKey + 
        '&language=en-US&query=' + searchTerm + '&include_adult=false')
        .then((res) => {
            movieData = res.data.results;

            //create output template
            let movieOutput = '';

            movieData.forEach(movie => {
              movieOutput += `
                <div class="col-md-3">
                  <div class="well text-center">
                    <img src="https://image.tmdb.org/t/p/w600_and_h900_bestv2/${movie.poster_path}"/>
                    <h5>${movie.original_title}</h5>
                    <a onClick="selectedMovie('${movie.id}', '${sluggify(movie.original_title)}')"
                     class="btn btn-primary" href="#">Details</a>
                  </div>
                </div>
              `;
            });
            $('#results').html(movieOutput);
        })
        .catch((err) => {
            console.log(err, 'Error');
        })
}

/**
 * Get the cast and the quotes from 
 * @param {int} movieID
 * @param {string} movieName 
 */
function searchDetails(movieID, movieName){
  axios.get('https://api.themoviedb.org/3/movie/' + movieID + '?api_key=' + tmdbApiKey)
    .then((res) => {
      movieDetail = res.data;
      return axios.get('https://api.themoviedb.org/3/movie/' + movieID + '/credits?api_key=' + tmdbApiKey)
    })
    .then((res) => {
      castData = res.data.cast;
      return axios({
        method: 'get',
        url: 'http://movie-quotes-app.herokuapp.com/api/v1/quotes?movie=' + sluggify(movieName),
        headers: {
            Authorization: 'Token token=' + movieQuotesApiKey
        }
      })
    })
    .then((res) => {
      quotesData = res.data;
      integrateSchema();
    })
    .catch((err) => {
      console.log(err, 'Error');
    })

}

/**
 * Transforms a string into a slug
 * @param {string} string 
 */
function sluggify(string){
    return string.replace(' ', '-').toLowerCase();
}

/**
 * Handles movie selection on the frontpage
 * @param {int} movieID 
 * @param {string} movieName 
 */
function selectedMovie(movieID, movieName){
  sessionStorage.setItem('filmID', movieID);
  sessionStorage.setItem('name', movieName);

  window.location = 'movie.html';
  return false;
}

/**
 * Function that is triggered after window was relocated to movie.html
 */
function getDetails(){
  let id = sessionStorage.getItem('filmID');
  let name = sessionStorage.getItem('name');

  searchDetails(id, name); 
}

/**
 * Generates the template which is renderted on the details page
 */
function generateDetailOutput(){
  let outputDetails = `
    <div class="row">
      <h1>Hello</h1>
    </div>
  `;
  $('#result').html(outputDetails);
}

/**  
 * Integrates the fetched data into one global schema
 */
function integrateSchema(){
  console.log('work');
  let movieList = [];
  console.log(movieDetail);
  let actorsList = [];
  castData.forEach(member => {
      let quotesList = [];
      quotesData.forEach(quote => {
          if(member.character === quote.character.name){
              quotesList.push({quote: quote.content, rating: quote.rating})
          }
      })
      actorsList.push({actor_name: member.name, character_name: member.character, quotes: quotesList});
  });
  movieList.push({
    id: movieDetail.id,
    imdbid: movieDetail.imdb_id,
    genres: movieDetail.genres,
    collection: movieDetail.belongs_to_collection,
    budget: movieDetail.budget,
    overview: movieDetail.overview,
    original_title: movieDetail.original_title,
    tagline: movieDetail.tagline,
    release: movieDetail.release_date,
    budget: movieDetail.budget,
    revenue: movieDetail.revenue,
    runtime: movieDetail.runtime,
    production_countries: movieDetail.production_countries,
    popularity: movieDetail.popularity,
    vote_average: movieDetail.vote_average,
    vote_count: movieDetail.vote_count,
    actors: actorsList
  });
  console.log(movieList);
}
