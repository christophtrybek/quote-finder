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
            console.log(res);
        })
        .catch((err) => {
            console.log(err, 'Error');
        })
}

/**
 * Get the cast and the quotes from 
 * @param {string} movieName 
 */
function searchDetails(movieID, movieName){
    let castData = [];
    let quotesData = [];
    
    axios.get('https://api.themoviedb.org/3/movie/' + movieID + '/credits?api_key=' + tmdbApiKey)
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err, 'Error');
        })
    
    axios({
        method: 'get',
        url: 'http://movie-quotes-app.herokuapp.com/api/v1/quotes?movie=' + searchTerm,
        headers: {
            Authorization: 'Token token=' + movieQuotesApiKey
        }
    })
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err, 'Error');
        })    
}