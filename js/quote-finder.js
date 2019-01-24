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
                  <div class="well text-center spacing">
                    <img onClick="selectedMovie('${movie.id}', '${sluggify(movie.original_title)}')"
                     src="https://image.tmdb.org/t/p/w600_and_h900_bestv2/${movie.poster_path}"/>
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
      console.log(quotesData);
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
 * Transforms the datestring into the german format
 * @param {string} datestring
 */
function changeDate(datestring){
  let year = datestring.substring(0,4);
  let month = datestring.substring(5,7);
  let day = datestring.substr(8,9);
  return (day+'.'+month+'.'+year);
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
 * Integrates the fetched data into one global schema
 */
function integrateSchema(){
  let movieList = [];
  let actorsList = [];
  let release_year = movieDetail.release_date.substring(0,4);
  castData.forEach(member => {
      let quotesList = [];
      quotesData.forEach(quote => {
          if((member.character === quote.character.name || member.name === quote.actor.name) 
          && release_year === quote.year.toString()){
              quotesList.push({quote: quote.content, rating: quote.rating})
          }
      })
      actorsList.push({actor_name: member.name, character_name: member.character, quotes: quotesList});
  });
  movieList.push({
    id: movieDetail.id,
    imdbid: movieDetail.imdb_id,
    poster_path: movieDetail.poster_path, 
    genres: movieDetail.genres,
    collection: movieDetail.belongs_to_collection,
    budget: movieDetail.budget,
    overview: movieDetail.overview,
    original_title: movieDetail.original_title,
    tagline: movieDetail.tagline,
    release: changeDate(movieDetail.release_date),
    budget: movieDetail.budget,
    revenue: movieDetail.revenue,
    runtime: movieDetail.runtime,
    production_countries: movieDetail.production_countries,
    popularity: movieDetail.popularity,
    vote_average: movieDetail.vote_average,
    vote_count: movieDetail.vote_count,
    actors: actorsList
  });
  generateDetailOutput(movieList[0]);
}

/**
 * Generates the template which is renderted on the details page
 */
function generateDetailOutput(detailedObject){
  let countries = '';
  detailedObject.production_countries.forEach(country => {
    countries += `
      ${country.name}
    `;
  })

  let genres = '';
  detailedObject.genres.forEach(genre => {
    genres += `
      ${genre.name}
    `;
  })

  let performer = '';
  detailedObject.actors.forEach(actor => {
    let sayings = '';
    if(actor.quotes.length > 0){
      actor.quotes.forEach(saying => {
        sayings +=`
          <div class="quotation-style">
            <i>"${saying.quote}</i>"
            <br/>
            <i class="fas fa-star"></i> ${saying.rating}
          </div>
        `;
      })
    }
    performer += `
      <div>
        <h5>${actor.character_name}</h5>
        <p>(${actor.actor_name})</p>
        <div>
          ${sayings}
        </div>
        <hr/>
      </div>  
    `;
  })

  let outputDetails = `
    <div class="row">
      <div class="col-md-8">
        <h1>${detailedObject.original_title}</h1>
        <h5><i>${detailedObject.tagline}</i></h5>
      </div>
    </div>
    <div class="row detail-summary">
      <div class="col-md-4">
        <hr/>
        <img class="detail-image" src="https://image.tmdb.org/t/p/w600_and_h900_bestv2/${detailedObject.poster_path}"/>
        <hr/>
        <h4>Plot</h4>
        <p>${detailedObject.overview}</p>
        <ul class="list-group">
          <li class="list-group-item"><b>Genres: </b>${genres}</li>
          <li class="list-group-item"><b>Release: </b>${detailedObject.release}</li>
          <li class="list-group-item"><b>Runtime: </b>${detailedObject.runtime} Days</li>
          <li class="list-group-item"><b>Popularity: </b>${detailedObject.popularity}</li>
          <li class="list-group-item"><b>Vote Average: </b>${detailedObject.vote_average}</li>
          <li class="list-group-item"><b>Vote Count: </b>${detailedObject.vote_count}</li>
          <li class="list-group-item"><b>Budget: </b>${detailedObject.budget}$</li>
          <li class="list-group-item"><b>Revenue: </b>${detailedObject.revenue}$</li>
          <li class="list-group-item"><b>Production Countries: </b>${countries}</li>
        </ul>
        <div class="button-group return-button">
          <a class="btn btn-primary" href="https://www.imdb.com/title/${detailedObject.imdbid}/" 
            target="_blank">Find me on IMDB</a>
          <a class="btn btn-danger" href="quote-finder.html">Return to Search</a>
        </div>
      </div>
      <div class="col-md-8">
        <h4>Starring</h4>
        <p>${performer}</p>
      </div>
    </div>
    <div class=row>
      <div class="col-md-4">
      </div>
      <div class="col-md-8">
      </div>
    </div>
  `;
  $('#result').html(outputDetails);
}