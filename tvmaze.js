/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async so it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
  const response = await axios.get('http://api.tvmaze.com/search/shows',
    {params: {q: query}});

  return createShowArray(response);
}

//Accepts API response data containing an array of show data and returns an array of objects with only the id, name, summary and image properties
function createShowArray(response) {
  const showArray = [];

  for (let item of response.data) {
    //Pull the keys we need from the show data
    const {id, name, summary} = item.show;

    //Set a default image, and assign to API image only if there is one
    let image = "https://tinyurl.com/tv-missing";
    if (item.show.image) {
      image = item.show.image.medium;
    }

    //Add all properties to the object and push to the show array
    const showObj = {id, name, summary, image};
    showArray.push(showObj);
  }

  return showArray;
}

/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */ 
function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  if (!shows.length) {
    $showsList.append('<p class="ml-3">No shows found with that term.</p>');
  }

  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 my-2 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
          <img class="card-img-top" src="${show.image}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
             <button class="btn btn-primary" data-toggle="modal" data-target="#episodes-area">Episodes</button>
           </div>
         </div>
       </div>
      `);

    $item.on('click', 'button', showEpisodes); 

    $showsList.append($item);
  }
}

//When a user clicks the Episodes button, clear any existing episodes then show the episodes for the card that was clicked
async function showEpisodes(event) {
  $('#episodes-list').empty()

  //Get the show ID from the closest container element with the show id data
  const id = $(event.target).closest('[data-show-id]').data('show-id');

  //Get episodes from API and populate the episode section with the episode list
  const episodes = await getEpisodes(id);
  populateEpisodes(episodes);
}


/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */
async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  let shows = await searchShows(query);

  populateShows(shows);
  $("#shows-query").val("");
}


/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

  return createEpisodeArray(response);
}

//Given episode API response data, create an array of objects with just the id, name, season, and number properties
function createEpisodeArray(response) {
  const episodes = []

  //for each episode in the response, pull the data we want, add it to an object and add the object to the array
  for (let episode of response.data) {
    const {id, name, season, number} = episode;
    const episodeObj = {id, name, season, number};
    episodes.push(episodeObj);
  }

  return episodes;
}

/* Given an array of episode data, clear the existing list and populate 
the episodes-list with a list of episodes for a given show*/
function populateEpisodes(episodes) {
  const $list = $('#episodes-list');

  if (episodes.length === 0) {
    $list.append('<li>No episodes found</li>');
  } else {
    for (let episode of episodes) {
      $list.append(`<li>${episode.name} (Season ${episode.season}, Episode ${episode.number})</li>`);
    }
  }
}

$("#search-form").on("submit", handleSearch);