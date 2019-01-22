/**
 * Global data source
 */
let movieData = [];
let castData = [];
let quotesData = [];

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
    let movieData = [];

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
    let castData = [];
    let quotesData = [];
    
    axios.get('https://api.themoviedb.org/3/movie/' + movieID + '/credits?api_key=' + tmdbApiKey)
        .then((res) => {
            castData = res.data.cast;
        })
        .catch((err) => {
            console.log(err, 'Error');
        })
    
    axios({
        method: 'get',
        url: 'http://movie-quotes-app.herokuapp.com/api/v1/quotes?movie=' + sluggify(movieName),
        headers: {
            Authorization: 'Token token=' + movieQuotesApiKey
        }
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
