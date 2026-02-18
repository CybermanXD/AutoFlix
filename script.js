const TMDB_API_KEY = "8c5107580c5a36557d7c01b6f920c344";
const TMDB_API_BASE = "https://tmdb-proxy-a9cp.onrender.com/tmdb";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";
const SUPABASE_LATEST_MOVIES_URL = "https://tokzbiepijjdvbdtacjz.supabase.co/storage/v1/object/public/autoflix-media-cache/latest-movies.json";
const SUPABASE_LATEST_TV_URL = "https://tokzbiepijjdvbdtacjz.supabase.co/storage/v1/object/public/autoflix-media-cache/latest-tv.json";
const HOME_TAB_DEFAULT = 'shows';
const HOME_PAGE_SIZE = 0x12;
const HOME_TOTAL_PAGES = 0xa;
let latestMoviesCache = {};
let latestShowsCache = {};
let latestMoviesData = null;
let latestShowsData = null;
let currentHomeTab = HOME_TAB_DEFAULT;
let currentHomePage = 0x1;
let currentMovieData = {};
let currentEmbedURL = '';
let currentSearchKeyword = '';
let currentSearchPage = 0x1;
let totalSearchResults = 0x0;
let currentOpenOptions = null;
let currentTvSeason = '';
let currentTvEpisode = '';
let currentEmbedServer = "vidsrc";
let currentEpisodeMap = null;
let currentEpisodeIds = [];
let isEpisodeLoading = false;
let totalSeasonsCount = 0x0;
let isEpisodeMenuOpen = false;
let isSeasonMenuOpen = false;
let isServerMenuOpen = false;
function toggleSearch() {
  const _0x11109f = document.getElementById("searchToggle");
  _0x11109f.style.display = _0x11109f.style.display === "block" ? "none" : "inline-block";
  if (_0x11109f.style.display === 'inline-block') {
    document.getElementById("searchInput").focus();
  }
}
function performSearch(_0x555fed = 0x1) {
  const _0x19c297 = document.getElementById("searchInput").value.trim();
  if (_0x19c297 === '') {
    return;
  }
  currentSearchKeyword = _0x19c297;
  currentSearchPage = _0x555fed;
  searchMovies(_0x19c297, _0x555fed);
}
function searchMovies(_0x2550f3, _0x3bd1a3) {
  const _0x4a4ef3 = document.getElementById("searchResults");
  _0x4a4ef3.innerHTML = "<p>Searching...</p>";
  fetch("https://www.omdbapi.com/?apikey=d17f7c1a&s=" + encodeURIComponent(_0x2550f3) + '&page=' + _0x3bd1a3).then(_0xcb0b4f => _0xcb0b4f.json()).then(_0x46355f => {
    _0x4a4ef3.innerHTML = '';
    document.getElementById('searchHeader').textContent = "Search Results for \"" + _0x2550f3 + "\"";
    if (_0x46355f.Response === "True") {
      totalSearchResults = parseInt(_0x46355f.totalResults);
      const _0x4fe77a = _0x46355f.Search.map(_0x3f3267 => {
        return fetch("https://www.omdbapi.com/?apikey=d17f7c1a&i=" + _0x3f3267.imdbID).then(_0x17a8b3 => _0x17a8b3.json()).then(_0x1102a5 => {
          return {
            'Title': _0x3f3267.Title,
            'Year': _0x3f3267.Year,
            'Poster': _0x3f3267.Poster,
            'imdbID': _0x3f3267.imdbID,
            'Genres': _0x1102a5 && _0x1102a5.Genre ? _0x1102a5.Genre : ''
          };
        })['catch'](() => ({
          'Title': _0x3f3267.Title,
          'Year': _0x3f3267.Year,
          'Poster': _0x3f3267.Poster,
          'imdbID': _0x3f3267.imdbID,
          'Genres': ''
        }));
      });
      Promise.all(_0x4fe77a).then(_0x57a7ce => {
        _0x57a7ce.forEach(_0x29dd33 => {
          _0x4a4ef3.appendChild(buildMovieCard(_0x29dd33));
        });
      });
    } else {
      _0x4a4ef3.innerHTML = "<p>No results found.</p>";
    }
    updateSearchPagination();
    history.pushState({
      'view': "searchView",
      'query': _0x2550f3,
      'page': _0x3bd1a3
    }, '', "#searchView?query=" + encodeURIComponent(_0x2550f3) + "&page=" + _0x3bd1a3);
    switchView("searchView", false);
  })["catch"](_0x23184b => {
    console.error(_0x23184b);
    _0x4a4ef3.innerHTML = "<p>Error searching movies.</p>";
  });
}

function buildMovieCard(_0x29dd33) {
  const _0x50d7cd = document.createElement('div');
  _0x50d7cd.className = "movie-item";
  _0x50d7cd.onclick = () => {
    showMovieDetails(_0x29dd33.imdbID);
  };
  if (_0x29dd33.Poster && _0x29dd33.Poster !== 'N/A') {
    let _0x1f40a1 = document.createElement("img");
    _0x1f40a1.src = _0x29dd33.Poster;
    _0x1f40a1.alt = _0x29dd33.Title;
    _0x50d7cd.appendChild(_0x1f40a1);
  }
  let _0x2bdf5c = document.createElement('p');
  _0x2bdf5c.textContent = _0x29dd33.Title;
  _0x50d7cd.appendChild(_0x2bdf5c);
  let _0x24c4c6 = document.createElement('p');
  _0x24c4c6.className = 'movie-year';
  _0x24c4c6.textContent = "Year: " + _0x29dd33.Year;
  _0x50d7cd.appendChild(_0x24c4c6);
  if (_0x29dd33.Genres) {
    let _0x6c2f1d = document.createElement('p');
    _0x6c2f1d.className = 'movie-genre';
    _0x6c2f1d.textContent = "Genre: " + _0x29dd33.Genres;
    _0x50d7cd.appendChild(_0x6c2f1d);
  }
  return _0x50d7cd;
}

function setHomeTab(_0x7d90a1) {
  currentHomeTab = _0x7d90a1;
  currentHomePage = 0x1;
  const _0x3fb529 = document.querySelectorAll('.tab-button');
  _0x3fb529.forEach(_0x2c968a => {
    _0x2c968a.classList.remove('active');
  });
  const _0x535d19 = _0x7d90a1 === 'shows' ? 0x1 : 0x0;
  if (_0x3fb529[_0x535d19]) {
    _0x3fb529[_0x535d19].classList.add('active');
  }
  loadHomeTabPage();
}

function renderHomeTab() {
  const _0x59a782 = document.getElementById("latestResults");
  if (!_0x59a782) {
    return;
  }
  setHomeLoading(false);
  const _0x11a38a = currentHomeTab === 'shows' ? latestShowsCache[currentHomePage] : latestMoviesCache[currentHomePage];
  _0x59a782.innerHTML = '';
  if (!_0x11a38a || _0x11a38a.length === 0x0) {
    _0x59a782.innerHTML = "<p>No items found.</p>";
    return;
  }
  _0x11a38a.forEach(_0x24c9fa => {
    _0x59a782.appendChild(buildMovieCard(_0x24c9fa));
  });
  updateHomePagination();
}

function updateHomePagination() {
  const _0x21b6d5 = document.getElementById('homePrevPage');
  const _0x2090c4 = document.getElementById('homeNextPage');
  const _0x39f7a9 = document.getElementById('homePageButtons');
  if (_0x21b6d5) {
    _0x21b6d5.disabled = currentHomePage <= 0x1;
  }
  if (_0x2090c4) {
    _0x2090c4.disabled = currentHomePage >= HOME_TOTAL_PAGES;
  }
  if (!_0x39f7a9) {
    return;
  }
  _0x39f7a9.innerHTML = '';
  const _0x11430e = Math.max(0x1, currentHomePage - 0x1);
  const _0x2a6652 = Math.min(HOME_TOTAL_PAGES, _0x11430e + 0x2);
  const _0x5a7f7f = _0x2a6652 - _0x11430e < 0x2 ? Math.max(0x1, _0x2a6652 - 0x2) : _0x11430e;
  for (let _0x3b3dd3 = _0x5a7f7f; _0x3b3dd3 <= _0x2a6652; _0x3b3dd3++) {
    const _0x5f08a6 = document.createElement('button');
    _0x5f08a6.className = 'page-button';
    _0x5f08a6.textContent = _0x3b3dd3;
    _0x5f08a6.onclick = () => goHomePage(_0x3b3dd3);
    if (_0x3b3dd3 === currentHomePage) {
      _0x5f08a6.classList.add('active');
    }
    _0x39f7a9.appendChild(_0x5f08a6);
  }
}

function changeHomePage(_0x1f0f6d) {
  const _0x2c5a4f = currentHomePage + _0x1f0f6d;
  goHomePage(_0x2c5a4f);
}

function goHomePage(_0x361e31) {
  const _0x25b0a4 = Number(_0x361e31);
  if (_0x25b0a4 < 0x1 || _0x25b0a4 > HOME_TOTAL_PAGES) {
    return;
  }
  currentHomePage = _0x25b0a4;
  loadHomeTabPage();
}

function loadHomeTabPage() {
  if (currentHomeTab === 'shows') {
    loadLatestShows(currentHomePage);
  } else {
    loadLatestMovies(currentHomePage);
  }
}

function loadLatestMovies(_0x3f5c44 = 0x1) {
  const _0x1aef21 = document.getElementById("latestResults");
  if (!_0x1aef21) {
    return;
  }
  if (latestMoviesCache[_0x3f5c44] && latestMoviesCache[_0x3f5c44].length > 0x0) {
    renderHomeTab();
    return;
  }
  if (latestMoviesData && latestMoviesData.pages) {
    latestMoviesCache[_0x3f5c44] = latestMoviesData.pages[String(_0x3f5c44)] || [];
    renderHomeTab();
    return;
  }
  if (currentHomeTab === 'movies') {
    _0x1aef21.innerHTML = '';
    setHomeLoading(true);
  }
  fetch(SUPABASE_LATEST_MOVIES_URL).then(_0x3eb28c => _0x3eb28c.json()).then(_0x2d2d1b => {
    latestMoviesData = _0x2d2d1b;
    const _0x3a43f2 = _0x2d2d1b && _0x2d2d1b.pages ? _0x2d2d1b.pages[String(_0x3f5c44)] : [];
    latestMoviesCache[_0x3f5c44] = _0x3a43f2 || [];
    if (currentHomeTab === 'movies') {
      renderHomeTab();
    }
  })['catch'](_0x230f2c => {
    console.error(_0x230f2c);
    latestMoviesCache[_0x3f5c44] = [];
    if (currentHomeTab === 'movies') {
      setHomeLoading(false);
      _0x1aef21.innerHTML = "<p>Error loading latest movies.</p>";
    }
  });
}

function loadLatestShows(_0x1c1d6d = 0x1) {
  const _0x3d76d3 = document.getElementById("latestResults");
  if (!_0x3d76d3) {
    return;
  }
  if (latestShowsCache[_0x1c1d6d] && latestShowsCache[_0x1c1d6d].length > 0x0) {
    renderHomeTab();
    return;
  }
  if (latestShowsData && latestShowsData.pages) {
    latestShowsCache[_0x1c1d6d] = latestShowsData.pages[String(_0x1c1d6d)] || [];
    renderHomeTab();
    return;
  }
  if (currentHomeTab === 'shows') {
    _0x3d76d3.innerHTML = '';
    setHomeLoading(true);
  }
  fetch(SUPABASE_LATEST_TV_URL).then(_0x2b6e98 => _0x2b6e98.json()).then(_0x152278 => {
    latestShowsData = _0x152278;
    const _0x4f9ed8 = _0x152278 && _0x152278.pages ? _0x152278.pages[String(_0x1c1d6d)] : [];
    latestShowsCache[_0x1c1d6d] = _0x4f9ed8 || [];
    if (currentHomeTab === 'shows') {
      renderHomeTab();
    }
  })['catch'](_0x5f3dd0 => {
    console.error(_0x5f3dd0);
    latestShowsCache[_0x1c1d6d] = [];
    if (currentHomeTab === 'shows') {
      setHomeLoading(false);
      _0x3d76d3.innerHTML = "<p>Error loading TV shows.</p>";
    }
  });
}

function setHomeLoading(_0x182112) {
  const _0x3b6f05 = document.getElementById('homeLoading');
  if (_0x3b6f05) {
    _0x3b6f05.style.display = _0x182112 ? 'block' : 'none';
  }
}
function updateSearchPagination() {
  const _0x4a1feb = document.getElementById('prevPage');
  const _0x1c21dc = document.getElementById('nextPage');
  _0x4a1feb.disabled = currentSearchPage <= 0x1;
  _0x1c21dc.disabled = currentSearchPage * 0xa >= totalSearchResults;
}
function changeSearchPage(_0x527d7a) {
  currentSearchPage += _0x527d7a;
  searchMovies(currentSearchKeyword, currentSearchPage);
}
function showMovieDetails(_0x24629a, _0x459565 = true, _0x5ece73 = 0x1) {
  fetch("https://www.omdbapi.com/?apikey=45e48b11&i=" + _0x24629a + "&plot=full").then(_0x24f40b => _0x24f40b.json()).then(_0x37197d => {
    currentMovieData = _0x37197d;
    totalSeasonsCount = 0x0;
    document.getElementById("detailTitle").textContent = _0x37197d.Title;
    document.getElementById('detailYear').textContent = _0x37197d.Year;
    document.getElementById("detailPlot").textContent = _0x37197d.Plot;
    document.getElementById("detailGenre").textContent = _0x37197d.Genre;
    document.getElementById("detailCountry").textContent = _0x37197d.Country;
    document.getElementById("detailActors").textContent = _0x37197d.Actors;
    document.getElementById("detailRating").innerHTML = "<a href=\"https://www.imdb.com/title/" + _0x37197d.imdbID + "\" target=\"_blank\">IMDB Rating: " + _0x37197d.imdbRating + '</a>';
    document.getElementById("detailPoster").src = _0x37197d.Poster && _0x37197d.Poster !== "N/A" ? _0x37197d.Poster : '';
    document.getElementById("actionButtons").innerHTML = '';
    if (_0x37197d.Type.toLowerCase() !== 'series') {
      let _0x44a88f = document.createElement("button");
      _0x44a88f.textContent = "Watch Now";
      _0x44a88f.onclick = () => {
        watchMovieEmbed(_0x37197d.imdbID);
      };
      document.getElementById('actionButtons').appendChild(_0x44a88f);
    }
    if (_0x37197d.Type.toLowerCase() === "series" && _0x37197d.totalSeasons) {
      document.getElementById('episodesSection').style.display = 'block';
      let _0x566eaa = document.getElementById('seasonSelect');
      _0x566eaa.innerHTML = '';
      totalSeasonsCount = Number(_0x37197d.totalSeasons);
      for (let _0x421209 = 0x1; _0x421209 <= totalSeasonsCount; _0x421209++) {
        let _0x57753d = document.createElement("option");
        _0x57753d.value = _0x421209;
        _0x57753d.textContent = "Season " + _0x421209;
        _0x566eaa.appendChild(_0x57753d);
      }
      _0x566eaa.value = _0x5ece73;
      _0x566eaa.onchange = () => {
        const _0x26486a = _0x566eaa.value;
        currentTvSeason = _0x26486a;
        loadEpisodes(_0x37197d.imdbID, _0x26486a);
      };
      loadEpisodes(_0x37197d.imdbID, _0x5ece73);
    } else {
      document.getElementById('episodesSection').style.display = "none";
    }
    loadSimilarTitles(_0x37197d);
    if (currentOpenOptions) {
      currentOpenOptions.remove();
      currentOpenOptions = null;
    }
    if (_0x459565) {
      let _0x2bf471 = "#detailView?id=" + _0x24629a;
      if (_0x37197d.Type.toLowerCase() === 'series') {
        _0x2bf471 += '&season=' + _0x5ece73;
      }
      history.pushState({
        'view': 'detailView',
        'imdbID': _0x24629a,
        'season': _0x5ece73
      }, '', _0x2bf471);
    }
    switchView("detailView", false);
  })["catch"](_0x34b323 => {
    console.error(_0x34b323);
  });
}

function loadSimilarTitles(_0x5c4a25) {
  const _0x39a6db = document.getElementById('similarResults');
  const _0x17522d = document.getElementById('similarSection');
  const _0x2b6f4d = document.getElementById('similarLoading');
  if (!_0x39a6db || !_0x17522d || !_0x5c4a25) {
    return;
  }
  if (_0x2b6f4d) {
    _0x2b6f4d.style.display = 'block';
  }
  _0x39a6db.innerHTML = '';
  const _0x3e82c4 = _0x5c4a25.Type && _0x5c4a25.Type.toLowerCase() === 'series' ? 'tv' : 'movie';
  const _0x4e93e0 = _0x5c4a25.imdbID;
  if (!_0x4e93e0) {
    _0x39a6db.innerHTML = "<p>No similar titles found.</p>";
    return;
  }
  fetch(TMDB_API_BASE + "/find/" + _0x4e93e0 + "?api_key=" + TMDB_API_KEY + "&external_source=imdb_id").then(_0x3c22e0 => _0x3c22e0.json()).then(_0x55b0c1 => {
    const _0x2c7f2a = _0x3e82c4 === 'tv' ? _0x55b0c1.tv_results : _0x55b0c1.movie_results;
    if (!_0x2c7f2a || _0x2c7f2a.length === 0x0) {
      if (_0x2b6f4d) {
        _0x2b6f4d.style.display = 'none';
      }
      _0x39a6db.innerHTML = "<p>No similar titles found.</p>";
      return;
    }
    const _0x2f1084 = _0x2c7f2a[0x0].id;
    return fetch(TMDB_API_BASE + "/" + _0x3e82c4 + "/" + _0x2f1084 + "/recommendations?api_key=" + TMDB_API_KEY).then(_0x8f0c7 => _0x8f0c7.json()).then(_0x8d64c5 => {
      if (!_0x8d64c5 || !_0x8d64c5.results || _0x8d64c5.results.length === 0x0) {
        if (_0x2b6f4d) {
          _0x2b6f4d.style.display = 'none';
        }
        _0x39a6db.innerHTML = "<p>No similar titles found.</p>";
        return;
      }
      const _0x7a0d62 = _0x8d64c5.results.slice(0x0, 0xc);
      const _0x373ea4 = _0x7a0d62.map(_0x4b30c0 => {
        const _0x1b5c9e = _0x3e82c4 === 'tv' ? 'tv' : 'movie';
        return fetch(TMDB_API_BASE + "/" + _0x1b5c9e + "/" + _0x4b30c0.id + "/external_ids?api_key=" + TMDB_API_KEY).then(_0x2b2e03 => _0x2b2e03.json()).then(_0x1feac1 => {
          if (!_0x1feac1 || !_0x1feac1.imdb_id) {
            return null;
          }
          return {
            'Title': _0x3e82c4 === 'tv' ? _0x4b30c0.name : _0x4b30c0.title,
            'Year': (_0x3e82c4 === 'tv' ? _0x4b30c0.first_air_date : _0x4b30c0.release_date || '').split('-')[0x0] || 'N/A',
            'Poster': _0x4b30c0.poster_path ? TMDB_IMAGE_BASE + _0x4b30c0.poster_path : '',
            'imdbID': _0x1feac1.imdb_id
          };
        })['catch'](() => null);
      });
      Promise.all(_0x373ea4).then(_0x1ef3a6 => {
        const _0x2f7da5 = _0x1ef3a6.filter(Boolean);
        if (_0x2b6f4d) {
          _0x2b6f4d.style.display = 'none';
        }
        _0x39a6db.innerHTML = '';
        if (_0x2f7da5.length === 0x0) {
          _0x39a6db.innerHTML = "<p>No similar titles found.</p>";
          return;
        }
        _0x2f7da5.forEach(_0x1a9504 => {
          _0x39a6db.appendChild(buildMovieCard(_0x1a9504));
        });
      });
    });
  })['catch'](_0x3f3dcf => {
    console.error(_0x3f3dcf);
    if (_0x2b6f4d) {
      _0x2b6f4d.style.display = 'none';
    }
    _0x39a6db.innerHTML = "<p>Error loading similar titles.</p>";
  });
}
function loadEpisodes(_0x216892, _0x26444f) {
  fetch("https://www.omdbapi.com/?apikey=45e48b11&i=" + _0x216892 + "&Season=" + _0x26444f).then(_0x56fcb8 => _0x56fcb8.json()).then(_0x565fbf => {
    const _0x1ae536 = document.getElementById("episodesList");
    _0x1ae536.innerHTML = '';
    currentEpisodeMap = null;
    currentEpisodeIds = [];
    if (_0x565fbf.Response === "True" && _0x565fbf.Episodes) {
      currentEpisodeMap = {};
      _0x565fbf.Episodes.forEach(_0x50c0ea => {
        const _0x3f99b8 = String(_0x50c0ea.Episode);
        currentEpisodeMap[_0x3f99b8] = _0x50c0ea;
        currentEpisodeIds.push(_0x3f99b8);
        let _0x66c16 = document.createElement('li');
        _0x66c16.textContent = "Episode " + _0x50c0ea.Episode + " - " + _0x50c0ea.Title;
        _0x66c16.onclick = function (_0x413eed) {
          _0x413eed.stopPropagation();
          showEpisodeOptions(this, _0x216892, _0x26444f, _0x50c0ea.Episode);
        };
        _0x1ae536.appendChild(_0x66c16);
      });
      populateSeasonSwitcher();
      populateEpisodeSwitcher();
      updateEpisodeNavButtons();
    } else {
      _0x1ae536.innerHTML = "<li>No episodes found</li>";
      populateSeasonSwitcher();
      populateEpisodeSwitcher();
      updateEpisodeNavButtons();
    }
  })["catch"](console.error);
}
function showEpisodeOptions(_0x42b8b5, _0x5a8139, _0x2f1513, _0x11bc44) {
  if (currentOpenOptions && currentOpenOptions.parentElement !== _0x42b8b5) {
    currentOpenOptions.remove();
    currentOpenOptions = null;
  }
  let _0x266d12 = _0x42b8b5.querySelector(".episode-options");
  if (_0x266d12) {
    _0x266d12.remove();
    currentOpenOptions = null;
    return;
  } else {
    _0x266d12 = document.createElement("div");
    _0x266d12.className = "episode-options";
    let _0x2b0d88 = document.createElement("button");
    _0x2b0d88.textContent = "Watch Now";
    _0x2b0d88.onclick = function (_0x2ecb0f) {
      _0x2ecb0f.stopPropagation();
      currentTvSeason = _0x2f1513;
      currentTvEpisode = _0x11bc44;
      let _0x53ce98 = "#embedViewerView?type=series&id=" + _0x5a8139 + "&season=" + _0x2f1513 + "&episode=" + _0x11bc44 + '&server=vidsrc';
      history.pushState({
        'view': 'embedViewerView'
      }, '', _0x53ce98);
      currentEmbedServer = "vidsrc";
      launchEmbed(_0x5a8139, 'series', "vidsrc", _0x2f1513, _0x11bc44);
    };
    _0x266d12.appendChild(_0x2b0d88);
    _0x42b8b5.appendChild(_0x266d12);
    currentOpenOptions = _0x266d12;
  }
}
function watchMovieEmbed(_0x3577aa) {
  let _0x26edea = "#embedViewerView?type=movie&id=" + _0x3577aa + '&server=' + "vidsrc";
  history.pushState({
    'view': "embedViewerView"
  }, '', _0x26edea);
  launchEmbed(_0x3577aa, "movie", "vidsrc");
}
function launchEmbed(_0x2ca902, _0x1f84ec, _0x4cdba6, _0x429c53 = null, _0x4407b5 = null) {
  currentEmbedServer = _0x4cdba6;
  let _0xc432cc = '';
  if (_0x1f84ec === 'movie') {
    if (_0x4cdba6 === "vidsrc") {
      _0xc432cc = "https://vidsrc.cc/v2/embed/movie/" + _0x2ca902 + "?autoPlay=false&quality=360p";
    } else {
      if (_0x4cdba6 === '2embed') {
        _0xc432cc = 'https://www.2embed.cc/embed/' + _0x2ca902;
      } else if (_0x4cdba6 === "autoembed") {
        _0xc432cc = "https://player.autoembed.cc/embed/movie/" + _0x2ca902;
      } else {
        _0xc432cc = 'https://embed.su/embed/movie/' + _0x2ca902;
      }
    }
  } else {
    if (_0x4cdba6 === "vidsrc") {
      _0xc432cc = "https://vidsrc.cc/v2/embed/tv/" + _0x2ca902 + '/' + _0x429c53 + '/' + _0x4407b5 + '?autoPlay=false&quality=360p';
    } else {
      if (_0x4cdba6 === "2embed") {
        _0xc432cc = "https://www.2embed.cc/embedtv/" + _0x2ca902 + "&s=" + _0x429c53 + "&e=" + _0x4407b5;
      } else if (_0x4cdba6 === "autoembed") {
        _0xc432cc = "https://player.autoembed.cc/embed/tv/" + _0x2ca902 + '/' + _0x429c53 + '/' + _0x4407b5;
      } else {
        _0xc432cc = "https://embed.su/embed/tv/" + _0x2ca902 + '/' + _0x429c53 + '/' + _0x4407b5;
      }
    }
  }
  currentEmbedURL = _0xc432cc;
  currentTvSeason = _0x429c53;
  currentTvEpisode = _0x4407b5;
  if (_0x1f84ec === 'series' && _0x2ca902) {
    fetch("https://www.omdbapi.com/?apikey=45e48b11&i=" + _0x2ca902 + "&plot=short").then(_0x27a064 => _0x27a064.json()).then(_0x51db0b => {
      if (_0x51db0b && _0x51db0b.totalSeasons) {
        totalSeasonsCount = Number(_0x51db0b.totalSeasons);
      }
      populateSeasonSwitcher();
    })['catch'](console.error);
  }
  if (_0x1f84ec === 'series' && _0x2ca902 && _0x429c53) {
    loadEpisodes(_0x2ca902, _0x429c53);
  }
  updateEpisodeNavButtons();
  fetch("https://www.omdbapi.com/?apikey=45e48b11&i=" + _0x2ca902 + "&plot=short").then(_0x1a0254 => _0x1a0254.json()).then(_0x53f800 => {
    currentMovieData = _0x53f800;
    showEmbedViewer();
  })['catch'](_0x3c078b => {
    console.error("Failed to fetch movie data:", _0x3c078b);
    currentMovieData = {
      'Title': 'Unknown',
      'Type': _0x1f84ec
    };
    showEmbedViewer();
  });
}
function showEmbedViewer() {
  const _0x615853 = document.getElementById('serverDropdown');
  if (_0x615853) {
    _0x615853.style.display = 'inline-block';
  }
  const _0x1b7f7c = document.getElementById('seriesOverviewBtn');
  if (_0x1b7f7c) {
    _0x1b7f7c.style.display = currentMovieData && currentMovieData.Type && currentMovieData.Type.toLowerCase() === 'series' ? 'inline-block' : 'none';
  }
  const _0x40d1eb = document.getElementById('seasonDropdown');
  if (_0x40d1eb) {
    _0x40d1eb.style.display = currentMovieData && currentMovieData.Type && currentMovieData.Type.toLowerCase() === 'series' ? 'inline-block' : 'none';
  }
  const _0x1f4e8a = document.getElementById('episodeDropdown');
  if (_0x1f4e8a) {
    _0x1f4e8a.style.display = currentMovieData && currentMovieData.Type && currentMovieData.Type.toLowerCase() === 'series' ? 'inline-block' : 'none';
  }
  populateServerMenu();
  updateEpisodeNavButtons();
  updateEmbedHeader();
  document.getElementById("embedFrame").src = currentEmbedURL;
  switchView("embedViewerView", false);
}
function switchServer(_0x336401) {
  currentEmbedServer = _0x336401;
  const _0x4dd990 = new URLSearchParams(window.location.hash.split('?')[0x1]);
  const _0x4f98fd = _0x4dd990.get("type");
  const _0x56a3d3 = _0x4dd990.get('id');
  const _0x5d1f5d = _0x4dd990.get("season");
  const _0x3a0179 = _0x4dd990.get("episode");
  launchEmbed(_0x56a3d3, _0x4f98fd, _0x336401, _0x5d1f5d, _0x3a0179);
  let _0x5c2863 = '#embedViewerView?type=' + _0x4f98fd + "&id=" + _0x56a3d3 + "&server=" + _0x336401;
  if (_0x5d1f5d && _0x3a0179) {
    _0x5c2863 += "&season=" + _0x5d1f5d + "&episode=" + _0x3a0179;
  }
  history.replaceState({
    'view': "embedViewerView"
  }, '', _0x5c2863);
}
function updateEmbedHeader() {
  const _0x52da3c = document.getElementById("embedHeader");
  if (currentMovieData && currentMovieData.Title) {
    if (currentMovieData.Type.toLowerCase() === "series") {
      _0x52da3c.innerText = "NOW WATCHING - " + currentMovieData.Title + " - Season " + currentTvSeason + " Episode " + currentTvEpisode;
    } else {
      _0x52da3c.innerText = "NOW WATCHING - " + currentMovieData.Title;
    }
    _0x52da3c.style.display = "block";
  } else {
    _0x52da3c.style.display = 'block';
  }
}
function switchView(_0x17c7a4, _0x233ecc = true) {
  if (_0x17c7a4 !== 'embedViewerView') {
    document.getElementById("embedFrame").src = '';
    document.getElementById('embedHeader').style.display = "none";
    const _0x278cd5 = document.getElementById('serverDropdown');
    if (_0x278cd5) {
      _0x278cd5.style.display = 'none';
    }
    const _0x5bdf3b = document.getElementById('seriesOverviewBtn');
    if (_0x5bdf3b) {
      _0x5bdf3b.style.display = 'none';
    }
    const _0x1b960a = document.getElementById('seasonDropdown');
    if (_0x1b960a) {
      _0x1b960a.style.display = 'none';
    }
    const _0x4f095d = document.getElementById('episodeDropdown');
    if (_0x4f095d) {
      _0x4f095d.style.display = 'none';
    }
    closeServerMenu();
    closeSeasonMenu();
    closeEpisodeMenu();
    const _0x3ed8b7 = document.getElementById('episodeNav');
    if (_0x3ed8b7) {
      _0x3ed8b7.style.display = 'none';
    }
    setEpisodeLoading(false);
  }
  const _0x1aae5b = document.getElementsByClassName("view");
  for (let _0x4879a8 of _0x1aae5b) {
    _0x4879a8.classList.remove("active");
  }
  document.getElementById(_0x17c7a4).classList.add("active");
  if (_0x17c7a4 !== "detailView" && currentOpenOptions) {
    currentOpenOptions.remove();
    currentOpenOptions = null;
  }
  if (_0x233ecc) {
    history.pushState({
      'view': _0x17c7a4
    }, '', '#' + _0x17c7a4);
  }
}

function goToSeriesOverview() {
  const _0x1b6324 = new URLSearchParams(window.location.hash.split('?')[0x1]);
  const _0x1c6a9f = _0x1b6324.get('id');
  const _0x1c3f6e = _0x1b6324.get('season') || currentTvSeason || 0x1;
  if (_0x1c6a9f) {
    showMovieDetails(_0x1c6a9f, true, _0x1c3f6e);
  } else {
    switchView('homeView');
  }
}
function closeEmbedViewer() {
  document.getElementById("embedFrame").src = '';
  document.getElementById("embedHeader").style.display = "none";
  setEpisodeLoading(false);
  history.back();
}

function updateEpisodeNavButtons() {
  const _0x1f3f0d = document.getElementById('episodeNav');
  if (!_0x1f3f0d) {
    return;
  }
  const _0x2c7d05 = document.getElementById('prevEpisodeBtn');
  const _0x1ef1d4 = document.getElementById('nextEpisodeBtn');
  const _0x53f8d1 = currentMovieData && currentMovieData.Type && currentMovieData.Type.toLowerCase() === 'series';
  if (!_0x53f8d1 || !currentTvSeason || !currentTvEpisode) {
    _0x1f3f0d.style.display = 'none';
    return;
  }
  _0x1f3f0d.style.display = 'flex';
  const _0x5d9b2c = getAdjacentEpisode(-1);
  const _0x1a0b72 = getAdjacentEpisode(1);
  _0x2c7d05.disabled = !_0x5d9b2c || isEpisodeLoading;
  _0x1ef1d4.disabled = !_0x1a0b72 || isEpisodeLoading;
  populateSeasonSwitcher();
  populateEpisodeSwitcher();
}

function getAdjacentEpisode(_0x2415f4) {
  if (!currentEpisodeIds || currentEpisodeIds.length === 0x0) {
    return null;
  }
  const _0x1e63dd = currentEpisodeIds.indexOf(String(currentTvEpisode));
  if (_0x1e63dd === -0x1) {
    return null;
  }
  const _0x45e2c4 = _0x1e63dd + _0x2415f4;
  if (_0x45e2c4 < 0x0 || _0x45e2c4 >= currentEpisodeIds.length) {
    return null;
  }
  const _0x3a1a4f = currentEpisodeIds[_0x45e2c4];
  return {
    'season': currentTvSeason,
    'episode': _0x3a1a4f
  };
}

function navigateEpisode(_0x1e4a19) {
  const _0x14f2b6 = getAdjacentEpisode(_0x1e4a19);
  if (!_0x14f2b6) {
    return;
  }
  setEpisodeLoading(true);
  const _0x5dfe0f = new URLSearchParams(window.location.hash.split('?')[0x1]);
  const _0x1960ce = _0x5dfe0f.get('id');
  const _0x7f9c8a = _0x5dfe0f.get('type') || 'series';
  const _0x4c4f3f = _0x5dfe0f.get('server') || currentEmbedServer;
  const _0x59e1f7 = '#embedViewerView?type=' + _0x7f9c8a + '&id=' + _0x1960ce + '&server=' + _0x4c4f3f + '&season=' + _0x14f2b6.season + '&episode=' + _0x14f2b6.episode;
  history.replaceState({
    'view': 'embedViewerView'
  }, '', _0x59e1f7);
  launchEmbed(_0x1960ce, _0x7f9c8a, _0x4c4f3f, _0x14f2b6.season, _0x14f2b6.episode);
}

function populateEpisodeSwitcher() {
  const _0x23f42a = document.getElementById('episodeMenu');
  const _0x28c5b2 = document.getElementById('episodeToggle');
  const _0x4e255a = document.getElementById('episodeDropdown');
  if (!_0x23f42a || !_0x28c5b2 || !_0x4e255a) {
    return;
  }
  const _0x4d69bb = currentMovieData && currentMovieData.Type && currentMovieData.Type.toLowerCase() === 'series';
  if (!_0x4d69bb || !currentTvSeason || currentEpisodeIds.length === 0x0) {
    _0x4e255a.style.display = 'none';
    _0x23f42a.innerHTML = '';
    _0x28c5b2.textContent = '';
    closeEpisodeMenu();
    return;
  }
  _0x4e255a.style.display = 'inline-block';
  _0x23f42a.innerHTML = '';
  currentEpisodeIds.forEach(_0x4e9f0c => {
    const _0x55be67 = currentEpisodeMap ? currentEpisodeMap[_0x4e9f0c] : null;
    const _0x3f4a9e = String(_0x4e9f0c).padStart(0x2, '0');
    const _0x1f9a92 = "Episode " + Number(_0x4e9f0c);
    const _0x10c4a5 = document.createElement('div');
    _0x10c4a5.className = 'custom-item';
    _0x10c4a5.dataset.value = _0x4e9f0c;
    _0x10c4a5.textContent = _0x1f9a92;
    if (String(currentTvEpisode) === String(_0x4e9f0c)) {
      _0x10c4a5.classList.add('active');
      _0x28c5b2.textContent = _0x1f9a92;
    }
    _0x10c4a5.onclick = () => {
      switchEpisode(_0x4e9f0c);
      closeEpisodeMenu();
    };
    _0x23f42a.appendChild(_0x10c4a5);
  });
  _0x28c5b2.disabled = isEpisodeLoading;
}

function populateSeasonSwitcher() {
  const _0x2a1d6d = document.getElementById('seasonMenu');
  const _0x49a2d1 = document.getElementById('seasonToggle');
  const _0x2c03c2 = document.getElementById('seasonDropdown');
  if (!_0x2a1d6d || !_0x49a2d1 || !_0x2c03c2) {
    return;
  }
  const _0x30a2c4 = currentMovieData && currentMovieData.Type && currentMovieData.Type.toLowerCase() === 'series';
  if (!_0x30a2c4 || totalSeasonsCount === 0x0) {
    _0x2c03c2.style.display = 'none';
    _0x2a1d6d.innerHTML = '';
    _0x49a2d1.textContent = '';
    closeSeasonMenu();
    return;
  }
  _0x2c03c2.style.display = 'inline-block';
  _0x2a1d6d.innerHTML = '';
  for (let _0x45b0a8 = 0x1; _0x45b0a8 <= totalSeasonsCount; _0x45b0a8++) {
    const _0x1a18ef = document.createElement('div');
    _0x1a18ef.className = 'custom-item';
    _0x1a18ef.dataset.value = _0x45b0a8;
    _0x1a18ef.textContent = "Season " + _0x45b0a8;
    if (String(currentTvSeason) === String(_0x45b0a8)) {
      _0x1a18ef.classList.add('active');
      _0x49a2d1.textContent = "Season " + _0x45b0a8;
    }
    _0x1a18ef.onclick = () => {
      switchSeason(_0x45b0a8);
      closeSeasonMenu();
    };
    _0x2a1d6d.appendChild(_0x1a18ef);
  }
  _0x49a2d1.disabled = isEpisodeLoading;
}

function switchSeason(_0x4f4d88) {
  if (!_0x4f4d88) {
    return;
  }
  const _0x4f4b3a = String(_0x4f4d88);
  if (String(currentTvSeason) === _0x4f4b3a) {
    return;
  }
  const _0x39b857 = new URLSearchParams(window.location.hash.split('?')[0x1]);
  const _0x421f15 = _0x39b857.get('id');
  const _0x3e93b4 = _0x39b857.get('type') || 'series';
  const _0x5794f2 = _0x39b857.get('server') || currentEmbedServer;
  currentTvSeason = _0x4f4b3a;
  currentTvEpisode = '1';
  setEpisodeLoading(true);
  const _0x449f5f = '#embedViewerView?type=' + _0x3e93b4 + '&id=' + _0x421f15 + '&server=' + _0x5794f2 + '&season=' + _0x4f4b3a + '&episode=1';
  history.replaceState({
    'view': 'embedViewerView'
  }, '', _0x449f5f);
  loadEpisodes(_0x421f15, _0x4f4b3a);
  launchEmbed(_0x421f15, _0x3e93b4, _0x5794f2, _0x4f4b3a, '1');
}

function switchEpisode(_0x1d8d9c) {
  if (!_0x1d8d9c) {
    return;
  }
  const _0x1aa5f9 = String(_0x1d8d9c);
  if (String(currentTvEpisode) === _0x1aa5f9) {
    return;
  }
  setEpisodeLoading(true);
  const _0x36c7e2 = new URLSearchParams(window.location.hash.split('?')[0x1]);
  const _0x5de14d = _0x36c7e2.get('id');
  const _0x12e3c0 = _0x36c7e2.get('type') || 'series';
  const _0x2e2b30 = _0x36c7e2.get('server') || currentEmbedServer;
  const _0x504392 = '#embedViewerView?type=' + _0x12e3c0 + '&id=' + _0x5de14d + '&server=' + _0x2e2b30 + '&season=' + currentTvSeason + '&episode=' + _0x1aa5f9;
  history.replaceState({
    'view': 'embedViewerView'
  }, '', _0x504392);
  launchEmbed(_0x5de14d, _0x12e3c0, _0x2e2b30, currentTvSeason, _0x1aa5f9);
}

function populateServerMenu() {
  const _0x4b3f3a = document.getElementById('serverMenu');
  const _0x2de3c0 = document.getElementById('serverToggle');
  const _0x5b8849 = document.getElementById('serverDropdown');
  if (!_0x4b3f3a || !_0x2de3c0 || !_0x5b8849) {
    return;
  }
  const _0x1c6cd7 = [{
    'value': 'vidsrc',
    'label': 'vidsrc.cc'
  }, {
    'value': 'embed',
    'label': 'embed.su'
  }, {
    'value': 'autoembed',
    'label': 'autoembed'
  }, {
    'value': '2embed',
    'label': '2embed'
  }];
  _0x5b8849.style.display = 'inline-block';
  _0x4b3f3a.innerHTML = '';
  _0x1c6cd7.forEach(_0x2f5c9b => {
    const _0x1b4f6e = document.createElement('div');
    _0x1b4f6e.className = 'custom-item';
    _0x1b4f6e.dataset.value = _0x2f5c9b.value;
    _0x1b4f6e.textContent = _0x2f5c9b.label;
    if (currentEmbedServer === _0x2f5c9b.value) {
      _0x1b4f6e.classList.add('active');
      _0x2de3c0.textContent = _0x2f5c9b.label;
    }
    _0x1b4f6e.onclick = () => {
      switchServer(_0x2f5c9b.value);
      closeServerMenu();
    };
    _0x4b3f3a.appendChild(_0x1b4f6e);
  });
}

function toggleSeasonMenu() {
  const _0x1af0a1 = document.getElementById('seasonDropdown');
  if (!_0x1af0a1) {
    return;
  }
  if (isSeasonMenuOpen) {
    closeSeasonMenu();
  } else {
    closeEpisodeMenu();
    closeServerMenu();
    _0x1af0a1.classList.add('open');
    isSeasonMenuOpen = true;
  }
}

function closeSeasonMenu() {
  const _0x3e69bb = document.getElementById('seasonDropdown');
  if (_0x3e69bb) {
    _0x3e69bb.classList.remove('open');
  }
  isSeasonMenuOpen = false;
}

function toggleServerMenu() {
  const _0x2e9094 = document.getElementById('serverDropdown');
  if (!_0x2e9094) {
    return;
  }
  if (isServerMenuOpen) {
    closeServerMenu();
  } else {
    closeEpisodeMenu();
    closeSeasonMenu();
    _0x2e9094.classList.add('open');
    isServerMenuOpen = true;
  }
}

function closeServerMenu() {
  const _0x5e8301 = document.getElementById('serverDropdown');
  if (_0x5e8301) {
    _0x5e8301.classList.remove('open');
  }
  isServerMenuOpen = false;
}

function toggleEpisodeMenu() {
  const _0x58b5da = document.getElementById('episodeDropdown');
  if (!_0x58b5da) {
    return;
  }
  if (isEpisodeMenuOpen) {
    closeEpisodeMenu();
  } else {
    closeSeasonMenu();
    closeServerMenu();
    _0x58b5da.classList.add('open');
    isEpisodeMenuOpen = true;
  }
}

function closeEpisodeMenu() {
  const _0x54eac6 = document.getElementById('episodeDropdown');
  if (_0x54eac6) {
    _0x54eac6.classList.remove('open');
  }
  isEpisodeMenuOpen = false;
}

function setEpisodeLoading(_0x46fb40) {
  isEpisodeLoading = _0x46fb40;
  const _0x5fdbd1 = document.getElementById('episodeLoading');
  if (_0x5fdbd1) {
    _0x5fdbd1.style.display = _0x46fb40 ? 'block' : 'none';
  }
  updateEpisodeNavButtons();
}
window.addEventListener('load', () => {
  const _0x2cfb8b = window.location.hash;
  const _0x4dbb8a = document.getElementById('embedFrame');
  if (_0x4dbb8a) {
    _0x4dbb8a.addEventListener('load', () => {
      setEpisodeLoading(false);
    });
  }
  document.addEventListener('click', _0x16786f => {
    const _0x2a3e2f = document.getElementById('episodeDropdown');
    const _0x1a2b54 = document.getElementById('seasonDropdown');
    const _0x430caa = document.getElementById('serverDropdown');
    if (_0x2a3e2f && !_0x2a3e2f.contains(_0x16786f.target)) {
      closeEpisodeMenu();
    }
    if (_0x1a2b54 && !_0x1a2b54.contains(_0x16786f.target)) {
      closeSeasonMenu();
    }
    if (_0x430caa && !_0x430caa.contains(_0x16786f.target)) {
      closeServerMenu();
    }
  });
  if (!_0x2cfb8b || _0x2cfb8b === "#homeView") {
    switchView("homeView", false);
    setHomeTab(HOME_TAB_DEFAULT);
    return;
  }
  let _0x1dab97 = new URLSearchParams(_0x2cfb8b.split('?')[0x1]);
  const _0x53db18 = _0x2cfb8b.split('?')[0x0].replace('#', '');
  if (_0x53db18 === 'detailView') {
    let _0x2b452d = _0x1dab97.get('id');
    let _0x51e517 = _0x1dab97.get("season") || 0x1;
    if (_0x2b452d) {
      showMovieDetails(_0x2b452d, false, _0x51e517);
    }
  } else {
    if (_0x53db18 === "embedViewerView") {
      const _0x4236da = _0x1dab97.get("type");
      const _0x57ad7f = _0x1dab97.get('id');
      const _0xa44445 = _0x1dab97.get("server") || 'vidsrc';
      const _0x338b08 = _0x1dab97.get('season');
      const _0x18ac1d = _0x1dab97.get("episode");
      currentEmbedServer = _0xa44445;
      launchEmbed(_0x57ad7f, _0x4236da, _0xa44445, _0x338b08, _0x18ac1d);
    } else {
      if (_0x53db18 === "searchView") {
        const _0x334a29 = _0x1dab97.get("query");
        const _0x2f6568 = parseInt(_0x1dab97.get("page")) || 0x1;
        if (_0x334a29) {
          document.getElementById("searchInput").value = _0x334a29;
          currentSearchKeyword = _0x334a29;
          currentSearchPage = _0x2f6568;
          searchMovies(_0x334a29, _0x2f6568);
        }
      } else {
        switchView("homeView", false);
        setHomeTab(HOME_TAB_DEFAULT);
      }
    }
  }
});
window.addEventListener("popstate", _0x53e716 => {
  if (_0x53e716.state && _0x53e716.state.view) {
    switchView(_0x53e716.state.view, false);
  } else {
    switchView("homeView", false);
  }
});
// Deployed via Render
