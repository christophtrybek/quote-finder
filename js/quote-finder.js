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
