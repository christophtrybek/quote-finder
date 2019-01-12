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
    axios.get('https://api.themoviedb.org/3/search/movie?api_key=' + tmdbApiKey + 
        '&language=en-US&query=' + searchTerm + '&include_adult=false')
        .then((res) => {
            movieData = res.data.results;
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
