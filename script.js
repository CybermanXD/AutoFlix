const TMDB_API_KEY = "8c5107580c5a36557d7c01b6f920c344";
const TMDB_API_BASE = "https://tmdb-proxy-a9cp.onrender.com/tmdb";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";
const SUPABASE_LATEST_MOVIES_URL = "https://tokzbiepijjdvbdtacjz.supabase.co/storage/v1/object/public/autoflix-media-cache/latest-movies.json";
const SUPABASE_LATEST_TV_URL = "https://tokzbiepijjdvbdtacjz.supabase.co/storage/v1/object/public/autoflix-media-cache/latest-tv.json";
const SUPABASE_LATEST_ANIME_URL = "https://tokzbiepijjdvbdtacjz.supabase.co/storage/v1/object/public/autoflix-media-cache/latest-anime.json";
const HOME_TAB_DEFAULT = 'shows';
const HOME_PAGE_SIZE = 0x12;
const HOME_DEFAULT_TOTAL_PAGES = 0x1;
let latestMoviesCache = [];
let latestShowsCache = [];
let latestAnimeCache = [];
let latestMoviesData = null;
let latestShowsData = null;
let latestAnimeData = null;
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
let currentTmdbId = '';
let currentEpisodeMap = null;
let currentEpisodeIds = [];
let isEpisodeLoading = false;
let totalSeasonsCount = 0x0;
let isEpisodeMenuOpen = false;
let isSeasonMenuOpen = false;
let isServerMenuOpen = false;
let movieGenresCache = null;
let tvGenresCache = null;
function getTotalTilesFromData(_0x4d4a6f) {
  if (!_0x4d4a6f || !_0x4d4a6f.pages) {
    return 0x0;
  }
  return Object.values(_0x4d4a6f.pages).reduce((_0x50d1d8, _0x3c1b6c) => {
    if (!Array.isArray(_0x3c1b6c)) {
      return _0x50d1d8;
    }
    return _0x50d1d8 + _0x3c1b6c.length;
  }, 0x0);
}
function getFlattenedItemsFromData(_0x15c3f9) {
  if (!_0x15c3f9 || !_0x15c3f9.pages) {
    return [];
  }
  const _0x3b2fd3 = new Date();
  const _0x5e74b9 = new Date(_0x3b2fd3.getFullYear(), _0x3b2fd3.getMonth(), _0x3b2fd3.getDate());
  return Object.values(_0x15c3f9.pages).flat().filter(_0x2f8e07 => {
    if (!_0x2f8e07 || !_0x2f8e07.Title) {
      return false;
    }
    if (!_0x2f8e07.ReleaseDate) {
      return true;
    }
    const _0x58ef31 = new Date(_0x2f8e07.ReleaseDate);
    if (isNaN(_0x58ef31)) {
      return true;
    }
    return _0x58ef31 <= _0x5e74b9;
  });
}
function getHomeTotalPages() {
  const _0x3c4b7d = currentHomeTab === 'shows' ? latestShowsCache : currentHomeTab === 'anime' ? latestAnimeCache : latestMoviesCache;
  const _0x47ccbe = Array.isArray(_0x3c4b7d) ? _0x3c4b7d.length : 0x0;
  return Math.max(HOME_DEFAULT_TOTAL_PAGES, Math.ceil(_0x47ccbe / HOME_PAGE_SIZE));
}
function toggleHomePageSelectMenu() {
  const _0x3b764d = document.getElementById('homePageSelect');
  const _0x4d2c8a = document.getElementById('homePageSelectToggle');
  if (!_0x3b764d) {
    return;
  }
  const _0x1b57a7 = _0x3b764d.classList.toggle('open');
  if (_0x4d2c8a) {
    _0x4d2c8a.setAttribute('aria-expanded', _0x1b57a7 ? 'true' : 'false');
  }
}
function closeHomePageSelectMenu() {
  const _0x3a2a66 = document.getElementById('homePageSelect');
  const _0x5a1c24 = document.getElementById('homePageSelectToggle');
  if (!_0x3a2a66) {
    return;
  }
  _0x3a2a66.classList.remove('open');
  if (_0x5a1c24) {
    _0x5a1c24.setAttribute('aria-expanded', 'false');
  }
}
const STATIC_ANIME_GENRES = [{
  'name': 'Action'
}, {
  'name': 'Adventure'
}, {
  'name': 'Animation'
}, {
  'name': 'Comedy'
}, {
  'name': 'Drama'
}, {
  'name': 'Fantasy'
}, {
  'name': 'Sci-Fi'
}, {
  'name': 'Romance'
}, {
  'name': 'Thriller'
}, {
  'name': 'Horror'
}, {
  'name': 'Mystery'
}];
function formatReleaseText(_0x2d7be5, _0x2a1e0a) {
  if (_0x2d7be5) {
    const _0x12a0b4 = new Date(_0x2d7be5);
    if (!isNaN(_0x12a0b4)) {
      return _0x12a0b4.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });
    }
  }
  if (_0x2a1e0a) {
    return String(_0x2a1e0a);
  }
  return 'N/A';
}
function formatEpisodeAirDate(_0x2c9c31) {
  if (!_0x2c9c31) {
    return 'N/A';
  }
  const _0x4a0b53 = new Date(_0x2c9c31);
  if (isNaN(_0x4a0b53)) {
    return 'N/A';
  }
  return _0x4a0b53.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}
function normalizeGenreText(_0x2c3c8a) {
  return String(_0x2c3c8a || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function buildGenreOptions(_0x1b2d7a, _0x3d4d9e, _0x3c15a9 = '') {
  if (!_0x1b2d7a) {
    return;
  }
  const _0x1e6b0e = _0x3c15a9;
  _0x1b2d7a.innerHTML = '';
  const _0x1d2e6a = [{
    'value': 'new',
    'label': 'Date (new first)'
  }, {
    'value': 'old',
    'label': 'Date (oldest first)'
  }];
  _0x1d2e6a.forEach(_0x24a4b1 => {
    const _0x4a4aa9 = document.createElement('option');
    _0x4a4aa9.value = _0x24a4b1.value;
    _0x4a4aa9.textContent = _0x24a4b1.label;
    _0x1b2d7a.appendChild(_0x4a4aa9);
  });
  (_0x3d4d9e || []).forEach(_0x55c1c4 => {
    const _0x4e0426 = _0x55c1c4 && _0x55c1c4.name ? _0x55c1c4.name : String(_0x55c1c4 || '').trim();
    if (!_0x4e0426) {
      return;
    }
    const _0x4f1a7b = normalizeGenreText(_0x4e0426);
    if (!_0x4f1a7b || _0x4f1a7b === 'new' || _0x4f1a7b === 'old') {
      return;
    }
    const _0x52e4b2 = document.createElement('option');
    _0x52e4b2.value = _0x4f1a7b;
    _0x52e4b2.textContent = _0x4e0426;
    _0x1b2d7a.appendChild(_0x52e4b2);
  });
  if (_0x1e6b0e) {
    _0x1b2d7a.value = _0x1e6b0e;
  }
}
function fetchGenresByType(_0x5d83f4) {
  if (_0x5d83f4 === 'movie' && movieGenresCache) {
    return Promise.resolve(movieGenresCache);
  }
  if (_0x5d83f4 === 'tv' && tvGenresCache) {
    return Promise.resolve(tvGenresCache);
  }
  return fetch(TMDB_API_BASE + "/genre/" + _0x5d83f4 + "/list?api_key=" + TMDB_API_KEY).then(_0x1cf846 => _0x1cf846.json()).then(_0x2d9d8e => {
    const _0x3a6e69 = _0x2d9d8e && _0x2d9d8e.genres ? _0x2d9d8e.genres : [];
    if (_0x5d83f4 === 'movie') {
      movieGenresCache = _0x3a6e69;
    } else if (_0x5d83f4 === 'tv') {
      tvGenresCache = _0x3a6e69;
    }
    return _0x3a6e69;
  })['catch'](_0x5c83ff => {
    console.error('Failed to load genres:', _0x5c83ff);
    return [];
  });
}
function updateGenreDropdownByType(_0x3b0f32 = '') {
  const _0x1f2b55 = document.getElementById('searchTypeFilter');
  const _0x3f0f1d = document.getElementById('searchSortFilter');
  if (!_0x1f2b55 || !_0x3f0f1d) {
    return;
  }
  const _0x12c2e8 = _0x3b0f32 || _0x3f0f1d.value;
  const _0x5d1d27 = _0x1f2b55.value || 'all';
  if (_0x5d1d27 === 'movies') {
    fetchGenresByType('movie').then(_0x44e61a => buildGenreOptions(_0x3f0f1d, _0x44e61a, _0x12c2e8));
    return;
  }
  if (_0x5d1d27 === 'shows') {
    fetchGenresByType('tv').then(_0x38ee68 => buildGenreOptions(_0x3f0f1d, _0x38ee68, _0x12c2e8));
    return;
  }
  if (_0x5d1d27 === 'anime') {
    buildGenreOptions(_0x3f0f1d, STATIC_ANIME_GENRES, _0x12c2e8);
    return;
  }
  Promise.all([fetchGenresByType('movie'), fetchGenresByType('tv')]).then(([_0x5e1a8f, _0x5df9a7]) => {
    const _0x4f979b = {};
    const _0x203fb4 = [];
    [...(_0x5e1a8f || []), ...(_0x5df9a7 || [])].forEach(_0x2f2a20 => {
      if (!_0x2f2a20 || !_0x2f2a20.name) {
        return;
      }
      const _0x174fd5 = normalizeGenreText(_0x2f2a20.name);
      if (_0x174fd5 && !_0x4f979b[_0x174fd5]) {
        _0x4f979b[_0x174fd5] = true;
        _0x203fb4.push(_0x2f2a20);
      }
    });
    buildGenreOptions(_0x3f0f1d, _0x203fb4, _0x12c2e8);
  });
}
function sortLatestByReleaseDate(_0x10368b = []) {
  const _0x1f9d2d = Array.isArray(_0x10368b) ? [..._0x10368b] : [];
  _0x1f9d2d.sort((_0x2383de, _0x4a8f5b) => {
    const _0x2e40a6 = _0x2383de && _0x2383de.ReleaseDate ? new Date(_0x2383de.ReleaseDate) : new Date(0x0);
    const _0x2e0ec4 = _0x4a8f5b && _0x4a8f5b.ReleaseDate ? new Date(_0x4a8f5b.ReleaseDate) : new Date(0x0);
    if (isNaN(_0x2e40a6)) {
      return 0x1;
    }
    if (isNaN(_0x2e0ec4)) {
      return -0x1;
    }
    return _0x2e0ec4 - _0x2e40a6;
  });
  return _0x1f9d2d;
}
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
  searchTmdb(_0x19c297, _0x555fed);
}
function applySearchFilters() {
  const _0x19c297 = document.getElementById("searchInput");
  if (_0x19c297) {
    _0x19c297.value = '';
  }
  currentSearchKeyword = '';
  currentSearchPage = 0x1;
  searchFilters(0x1);
}
function searchTmdb(_0x2550f3, _0x3bd1a3) {
  const _0x4a4ef3 = document.getElementById("searchResults");
  const _0x1f2c44 = document.getElementById('searchHeader');
  _0x4a4ef3.innerHTML = "<p>Searching...</p>";
  fetch(TMDB_API_BASE + "/search/multi?api_key=" + TMDB_API_KEY + "&query=" + encodeURIComponent(_0x2550f3) + "&page=" + _0x3bd1a3).then(_0xcb0b4f => _0xcb0b4f.json()).then(_0x46355f => {
    if (_0x1f2c44) {
      _0x1f2c44.textContent = "Search Results for \"" + _0x2550f3 + "\"";
    }
    if (_0x46355f && _0x46355f.results && _0x46355f.results.length > 0x0) {
      totalSearchResults = parseInt(_0x46355f.total_results || 0x0);
      const _0x4fe77a = _0x46355f.results.filter(_0x3f3267 => _0x3f3267.media_type === 'movie' || _0x3f3267.media_type === 'tv').map(_0x3f3267 => {
      const _0x4d7f2f = _0x3f3267.media_type;
      return fetch(TMDB_API_BASE + "/" + _0x4d7f2f + "/" + _0x3f3267.id + "/external_ids?api_key=" + TMDB_API_KEY).then(_0x17a8b3 => _0x17a8b3.json()).then(_0x1102a5 => {
        const _0x5aee63 = _0x4d7f2f === 'tv' ? _0x3f3267.name : _0x3f3267.title;
        const _0x25644a = _0x4d7f2f === 'tv' ? _0x3f3267.first_air_date : _0x3f3267.release_date;
        return {
          'Title': _0x5aee63 || 'Unknown',
          'Year': (_0x25644a || '').split('-')[0x0] || 'N/A',
          'ReleaseDate': _0x25644a || '',
          'Poster': _0x3f3267.poster_path ? TMDB_IMAGE_BASE + _0x3f3267.poster_path : '',
          'imdbID': _0x1102a5 ? _0x1102a5.imdb_id : '',
          'Genres': '',
          'tmdbId': _0x3f3267.id,
          'mediaType': _0x4d7f2f,
          'useTmdb': _0x4d7f2f === 'tv'
        };
      })['catch'](() => ({
        'Title': _0x4d7f2f === 'tv' ? _0x3f3267.name : _0x3f3267.title,
        'Year': (_0x4d7f2f === 'tv' ? _0x3f3267.first_air_date : _0x3f3267.release_date || '').split('-')[0x0] || 'N/A',
        'ReleaseDate': _0x4d7f2f === 'tv' ? _0x3f3267.first_air_date : _0x3f3267.release_date || '',
        'Poster': _0x3f3267.poster_path ? TMDB_IMAGE_BASE + _0x3f3267.poster_path : '',
        'imdbID': '',
        'Genres': '',
        'tmdbId': _0x3f3267.id,
          'mediaType': _0x4d7f2f,
          'useTmdb': _0x4d7f2f === 'tv'
        }));
      });
      Promise.all(_0x4fe77a).then(_0x57a7ce => {
        _0x4a4ef3.innerHTML = '';
        const _0x4d0a13 = (_0x3bd1a3 - 0x1) * HOME_PAGE_SIZE;
        const _0x2fd7ae = _0x57a7ce.slice(_0x4d0a13, _0x4d0a13 + HOME_PAGE_SIZE);
        _0x2fd7ae.forEach(_0x29dd33 => {
          _0x4a4ef3.appendChild(buildMovieCard(_0x29dd33));
        });
        updateSearchPagination();
      });
    } else {
      _0x4a4ef3.innerHTML = "<p>No results found.</p>";
    }
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
function searchFilters(_0x3bd1a3) {
  const _0x4a4ef3 = document.getElementById("searchResults");
  const _0x1f2b55 = document.getElementById('searchTypeFilter');
  const _0x3f0f1d = document.getElementById('searchSortFilter');
  const _0x5d1d27 = _0x1f2b55 ? _0x1f2b55.value : 'all';
  const _0x52b1a1 = _0x3f0f1d ? _0x3f0f1d.value : 'new';
  const _0x5b9a76 = _0x52b1a1 !== 'new' && _0x52b1a1 !== 'old' ? _0x52b1a1 : '';
  const _0x2fe1a1 = normalizeGenreText(_0x5b9a76);
  const _0x2a6c30 = _0x52b1a1 === 'old' ? 'old' : 'new';
  const _0x1f2c44 = document.getElementById('searchHeader');
  if (_0x1f2c44) {
    _0x1f2c44.textContent = 'Filtered Results';
  }
  _0x4a4ef3.innerHTML = "<p>Searching...</p>";
  const _0x4b2f59 = [];
  const _0x1a9c3c = () => {
    const _0x2e2a1c = _0x4b2f59.flat();
    let _0x2f3039 = _0x2e2a1c;
    if (_0x2fe1a1) {
      _0x2f3039 = _0x2f3039.filter(_0x2f77a4 => normalizeGenreText(_0x2f77a4.Genres || '').includes(_0x2fe1a1));
    }
    _0x2f3039 = _0x2f3039.filter(_0x1b3f92 => _0x1b3f92.Title && _0x1b3f92.imdbID);
    const _0x3f0f1d = new Date().getFullYear();
    _0x2f3039 = _0x2f3039.filter(_0x3a7fda => {
      const _0x46c0f0 = parseInt(_0x3a7fda.Year || '0');
      return !_0x46c0f0 || _0x46c0f0 <= _0x3f0f1d;
    });
    const _0x2c3f1a = new Date();
    const _0x48c07a = new Date(_0x2c3f1a.getFullYear(), _0x2c3f1a.getMonth(), _0x2c3f1a.getDate());
    _0x2f3039 = _0x2f3039.filter(_0x4ef3bb => {
      if (!_0x4ef3bb.ReleaseDate) {
        return true;
      }
      const _0x13d6e4 = new Date(_0x4ef3bb.ReleaseDate);
      if (isNaN(_0x13d6e4)) {
        return true;
      }
      return _0x13d6e4 <= _0x48c07a;
    });
    _0x2f3039.sort((_0x11a3b6, _0x319c30) => {
      const _0x48f0e5 = parseInt(_0x11a3b6.Year || '0');
      const _0x1b3bd4 = parseInt(_0x319c30.Year || '0');
      return _0x2a6c30 === 'old' ? _0x48f0e5 - _0x1b3bd4 : _0x1b3bd4 - _0x48f0e5;
    });
    _0x4a4ef3.innerHTML = '';
    if (_0x2f3039.length === 0x0) {
      _0x4a4ef3.innerHTML = "<p>No results found.</p>";
      return;
    }
    totalSearchResults = _0x2f3039.length;
    currentSearchPage = _0x3bd1a3;
    const _0x4d0a13 = (_0x3bd1a3 - 0x1) * HOME_PAGE_SIZE;
    const _0x2fd7ae = _0x2f3039.slice(_0x4d0a13, _0x4d0a13 + HOME_PAGE_SIZE);
    _0x2fd7ae.forEach(_0x29dd33 => {
      _0x4a4ef3.appendChild(buildMovieCard(_0x29dd33));
    });
    updateSearchPagination();
  };
  const _0x3d0c0b = (_0x17d53b) => {
    if (!_0x17d53b || !_0x17d53b.pages) {
      return [];
    }
    return Object.values(_0x17d53b.pages).flat();
  };
  const _0x5e3a5e = (_0x1a59e1, _0x3c0dbf) => {
    const _0x3afc9f = _0x3d0c0b(_0x1a59e1).filter(_0x1a5ed0 => _0x1a5ed0.imdbID && _0x1a5ed0.Title);
    return _0x3afc9f.map(_0x1a5ed0 => ({
      ..._0x1a5ed0,
      useTmdb: _0x3c0dbf === 'anime'
    }));
  };
  const _0x3f5d8b = [];
  if (_0x5d1d27 === 'all' || _0x5d1d27 === 'movies') {
    _0x3f5d8b.push(fetch(SUPABASE_LATEST_MOVIES_URL).then(_0x1a1f0f => _0x1a1f0f.json()).then(_0x2a8d9a => {
      _0x4b2f59.push(_0x5e3a5e(_0x2a8d9a, 'movies'));
    }));
  }
  if (_0x5d1d27 === 'all' || _0x5d1d27 === 'shows') {
    _0x3f5d8b.push(fetch(SUPABASE_LATEST_TV_URL).then(_0x3a4f4e => _0x3a4f4e.json()).then(_0x2a93f2 => {
      _0x4b2f59.push(_0x5e3a5e(_0x2a93f2, 'shows'));
    }));
  }
  if (_0x5d1d27 === 'all' || _0x5d1d27 === 'anime') {
    _0x3f5d8b.push(fetch(SUPABASE_LATEST_ANIME_URL).then(_0x3a5f2b => _0x3a5f2b.json()).then(_0x2b8a6b => {
      _0x4b2f59.push(_0x5e3a5e(_0x2b8a6b, 'anime'));
    }));
  }
  Promise.all(_0x3f5d8b).then(() => {
    _0x1a9c3c();
    const _0x2a8f3c = new URLSearchParams();
    _0x2a8f3c.set('page', _0x3bd1a3);
    _0x2a8f3c.set('type', _0x5d1d27);
    _0x2a8f3c.set('sort', _0x52b1a1);
    if (_0x5b9a76) {
      _0x2a8f3c.set('genre', _0x5b9a76);
    }
    const _0x1da6ac = "#filterView?" + _0x2a8f3c.toString();
    history.pushState({
      'view': "filterView",
      'query': '',
      'page': _0x3bd1a3,
      'type': _0x5d1d27,
      'sort': _0x52b1a1,
      'genre': _0x5b9a76
    }, '', _0x1da6ac);
    switchView("filterView", false);
  })["catch"](_0x23184b => {
    console.error(_0x23184b);
    _0x4a4ef3.innerHTML = "<p>Error searching movies.</p>";
  });
}

function buildMovieCard(_0x29dd33) {
  const _0x50d7cd = document.createElement('div');
  _0x50d7cd.className = "movie-item";
  _0x50d7cd.onclick = () => {
    showMovieDetails(_0x29dd33.imdbID, true, 0x1, _0x29dd33);
  };
  if (_0x29dd33 && _0x29dd33.Title) {
    _0x50d7cd.dataset.title = _0x29dd33.Title;
  }
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
  _0x24c4c6.textContent = "Released: " + formatReleaseText(_0x29dd33.ReleaseDate || '', _0x29dd33.Year);
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
  const _0x535d19 = document.querySelector(`.tab-button[data-tab="${_0x7d90a1}"]`);
  if (_0x535d19) {
    _0x535d19.classList.add('active');
  }
  loadHomeTabPage();
}

function renderHomeTab() {
  const _0x59a782 = document.getElementById("latestResults");
  if (!_0x59a782) {
    return;
  }
  setHomeLoading(false);
  const _0x2a7fe3 = currentHomeTab === 'shows' ? latestShowsCache : currentHomeTab === 'anime' ? latestAnimeCache : latestMoviesCache;
  const _0x51c11f = (_0x2a7fe3 && _0x2a7fe3.length > 0x0) ? _0x2a7fe3 : [];
  const _0x2a10dd = (currentHomePage - 0x1) * HOME_PAGE_SIZE;
  const _0x11a38a = _0x51c11f.slice(_0x2a10dd, _0x2a10dd + HOME_PAGE_SIZE);
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
  const _0x29a0b3 = document.getElementById('homePageSelect');
  const _0x4217cf = document.getElementById('homePageSelectToggle');
  const _0x4c3b64 = document.getElementById('homePageSelectMenu');
  const _0x3b3f36 = getHomeTotalPages();
  if (currentHomePage > _0x3b3f36) {
    currentHomePage = _0x3b3f36;
  }
  if (_0x4217cf) {
    _0x4217cf.textContent = "Page " + currentHomePage + " of " + _0x3b3f36;
    _0x4217cf.onclick = toggleHomePageSelectMenu;
  }
  if (_0x4c3b64) {
    _0x4c3b64.innerHTML = '';
    for (let _0x3d7ef9 = 0x1; _0x3d7ef9 <= _0x3b3f36; _0x3d7ef9++) {
      const _0x20f967 = document.createElement('button');
      _0x20f967.type = 'button';
      _0x20f967.className = 'home-page-select__option';
      _0x20f967.setAttribute('role', 'option');
      _0x20f967.setAttribute('aria-selected', _0x3d7ef9 === currentHomePage ? 'true' : 'false');
      _0x20f967.textContent = "Page " + _0x3d7ef9 + " of " + _0x3b3f36;
      if (_0x3d7ef9 === currentHomePage) {
        _0x20f967.classList.add('active');
      }
      _0x20f967.onclick = () => {
        goHomePage(_0x3d7ef9);
        closeHomePageSelectMenu();
      };
      _0x4c3b64.appendChild(_0x20f967);
    }
  }
  if (_0x21b6d5) {
    _0x21b6d5.disabled = currentHomePage <= 0x1;
  }
  if (_0x2090c4) {
    _0x2090c4.disabled = currentHomePage >= _0x3b3f36;
  }
  if (!_0x39f7a9) {
    return;
  }
  _0x39f7a9.innerHTML = '';
  const _0x11430e = Math.max(0x1, currentHomePage - 0x1);
  const _0x2a6652 = Math.min(_0x3b3f36, _0x11430e + 0x2);
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
  if (_0x29a0b3 && !_0x4c3b64) {
    closeHomePageSelectMenu();
  }
}

function changeHomePage(_0x1f0f6d) {
  const _0x2c5a4f = currentHomePage + _0x1f0f6d;
  goHomePage(_0x2c5a4f);
}

function goHomePage(_0x361e31) {
  const _0x25b0a4 = Number(_0x361e31);
  const _0x2d6d8c = getHomeTotalPages();
  if (_0x25b0a4 < 0x1 || _0x25b0a4 > _0x2d6d8c) {
    return;
  }
  currentHomePage = _0x25b0a4;
  loadHomeTabPage();
}

function loadHomeTabPage() {
  if (currentHomeTab === 'shows') {
    loadLatestShows(currentHomePage);
  } else if (currentHomeTab === 'anime') {
    loadLatestAnime(currentHomePage);
  } else {
    loadLatestMovies(currentHomePage);
  }
}

function loadLatestMovies(_0x3f5c44 = 0x1) {
  const _0x1aef21 = document.getElementById("latestResults");
  if (!_0x1aef21) {
    return;
  }
  if (latestMoviesCache && latestMoviesCache.length > 0x0) {
    renderHomeTab();
    return;
  }
  if (latestMoviesData && latestMoviesData.pages) {
    latestMoviesCache = sortLatestByReleaseDate(getFlattenedItemsFromData(latestMoviesData));
    renderHomeTab();
    return;
  }
  if (currentHomeTab === 'movies') {
    _0x1aef21.innerHTML = '';
    setHomeLoading(true);
  }
  fetch(SUPABASE_LATEST_MOVIES_URL).then(_0x3eb28c => _0x3eb28c.json()).then(_0x2d2d1b => {
    latestMoviesData = _0x2d2d1b;
    latestMoviesCache = sortLatestByReleaseDate(getFlattenedItemsFromData(_0x2d2d1b));
    if (currentHomeTab === 'movies') {
      renderHomeTab();
    }
  })['catch'](_0x230f2c => {
    console.error(_0x230f2c);
    latestMoviesCache = [];
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
  if (latestShowsCache && latestShowsCache.length > 0x0) {
    renderHomeTab();
    return;
  }
  if (latestShowsData && latestShowsData.pages) {
    latestShowsCache = sortLatestByReleaseDate(getFlattenedItemsFromData(latestShowsData));
    renderHomeTab();
    return;
  }
  if (currentHomeTab === 'shows') {
    _0x3d76d3.innerHTML = '';
    setHomeLoading(true);
  }
  fetch(SUPABASE_LATEST_TV_URL).then(_0x2b6e98 => _0x2b6e98.json()).then(_0x152278 => {
    latestShowsData = _0x152278;
    latestShowsCache = sortLatestByReleaseDate(getFlattenedItemsFromData(_0x152278));
    if (currentHomeTab === 'shows') {
      renderHomeTab();
    }
  })['catch'](_0x5f3dd0 => {
    console.error(_0x5f3dd0);
    latestShowsCache = [];
    if (currentHomeTab === 'shows') {
      setHomeLoading(false);
      _0x3d76d3.innerHTML = "<p>Error loading TV shows.</p>";
    }
  });
}

function loadLatestAnime(_0x4a0f72 = 0x1) {
  const _0x2c4f3e = document.getElementById("latestResults");
  if (!_0x2c4f3e) {
    return;
  }
  if (latestAnimeCache && latestAnimeCache.length > 0x0) {
    renderHomeTab();
    return;
  }
  if (latestAnimeData && latestAnimeData.pages) {
    latestAnimeCache = sortLatestByReleaseDate(getFlattenedItemsFromData(latestAnimeData));
    renderHomeTab();
    return;
  }
  if (currentHomeTab === 'anime') {
    _0x2c4f3e.innerHTML = '';
    setHomeLoading(true);
  }
  fetch(SUPABASE_LATEST_ANIME_URL).then(_0x53dfb7 => _0x53dfb7.json()).then(_0x2b4f76 => {
    latestAnimeData = _0x2b4f76;
    latestAnimeCache = sortLatestByReleaseDate(getFlattenedItemsFromData(_0x2b4f76));
    if (currentHomeTab === 'anime') {
      renderHomeTab();
    }
  })['catch'](_0x4f5e0b => {
    console.error(_0x4f5e0b);
    latestAnimeCache = [];
    if (currentHomeTab === 'anime') {
      setHomeLoading(false);
      _0x2c4f3e.innerHTML = "<p>Error loading latest anime.</p>";
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
  const _0x21c8b5 = document.getElementById('searchPageButtons');
  const _0x3157a6 = Math.max(0x1, Math.ceil(totalSearchResults / HOME_PAGE_SIZE));
  _0x4a1feb.disabled = currentSearchPage <= 0x1;
  _0x1c21dc.disabled = currentSearchPage >= _0x3157a6;
  if (!_0x21c8b5) {
    return;
  }
  _0x21c8b5.innerHTML = '';
  const _0x1ef6c6 = Math.max(0x1, Math.min(currentSearchPage - 0x1, _0x3157a6 - 0x2));
  const _0x4f63de = Math.min(_0x3157a6, _0x1ef6c6 + 0x2);
  for (let _0x3b3dd3 = _0x1ef6c6; _0x3b3dd3 <= _0x4f63de; _0x3b3dd3++) {
    const _0x5f08a6 = document.createElement('button');
    _0x5f08a6.className = 'page-button';
    _0x5f08a6.textContent = _0x3b3dd3;
    _0x5f08a6.onclick = () => {
      currentSearchPage = _0x3b3dd3;
      if (currentSearchKeyword && currentSearchKeyword.trim().length > 0x0) {
        searchTmdb(currentSearchKeyword, currentSearchPage);
      } else {
        searchFilters(currentSearchPage);
      }
    };
    if (_0x3b3dd3 === currentSearchPage) {
      _0x5f08a6.classList.add('active');
    }
    _0x21c8b5.appendChild(_0x5f08a6);
  }
}
function changeSearchPage(_0x527d7a) {
  currentSearchPage += _0x527d7a;
  if (currentSearchKeyword && currentSearchKeyword.trim().length > 0x0) {
    searchTmdb(currentSearchKeyword, currentSearchPage);
  } else {
    searchFilters(currentSearchPage);
  }
}
function showMovieDetails(_0x24629a, _0x459565 = true, _0x5ece73 = 0x1, _0x2e33e8 = null) {
  if (_0x2e33e8 && _0x2e33e8.useTmdb && _0x2e33e8.tmdbId) {
    fetch(TMDB_API_BASE + "/tv/" + _0x2e33e8.tmdbId + "?api_key=" + TMDB_API_KEY).then(_0x27e84f => _0x27e84f.json()).then(_0x1a3fb0 => {
      currentMovieData = {
        'Title': _0x1a3fb0.name || _0x2e33e8.Title || 'Unknown',
        'Type': 'series',
        'imdbID': _0x2e33e8.imdbID || ''
      };
      totalSeasonsCount = 0x0;
      document.getElementById("detailTitle").textContent = _0x1a3fb0.name || _0x2e33e8.Title || 'Unknown';
      document.getElementById('detailYear').textContent = formatReleaseText(_0x1a3fb0.first_air_date || '', _0x2e33e8.Year || 'N/A');
      document.getElementById("detailPlot").textContent = _0x1a3fb0.overview || '';
      document.getElementById("detailGenre").textContent = _0x1a3fb0.genres ? _0x1a3fb0.genres.map(_0x2d1f29 => _0x2d1f29.name).join(', ') : (_0x2e33e8.Genres || '');
      document.getElementById("detailCountry").textContent = _0x1a3fb0.origin_country ? _0x1a3fb0.origin_country.join(', ') : '';
      document.getElementById("detailActors").textContent = '';
      document.getElementById("detailRating").innerHTML = _0x2e33e8.imdbID ? "<a href=\"https://www.imdb.com/title/" + _0x2e33e8.imdbID + "\" target=\"_blank\">IMDB Rating: N/A</a>" : '';
      document.getElementById("detailPoster").src = _0x1a3fb0.poster_path ? TMDB_IMAGE_BASE + _0x1a3fb0.poster_path : (_0x2e33e8.Poster || '');
      document.getElementById("actionButtons").innerHTML = '';
      if (_0x2e33e8.imdbID) {
        let _0x44a88f = document.createElement("button");
        _0x44a88f.textContent = "Watch Now";
        _0x44a88f.onclick = () => {
          currentTvSeason = String(_0x5ece73 || 0x1);
          currentTvEpisode = '1';
          currentTmdbId = _0x2e33e8.tmdbId;
          let _0x53ce98 = "#embedViewerView?type=series&id=" + _0x2e33e8.imdbID + "&season=" + currentTvSeason + "&episode=" + currentTvEpisode + '&server=vidsrc&tmdb=' + _0x2e33e8.tmdbId;
          history.pushState({
            'view': 'embedViewerView'
          }, '', _0x53ce98);
          currentEmbedServer = "vidsrc";
          currentMovieData = {
            'Title': _0x1a3fb0.name || _0x2e33e8.Title || 'Unknown',
            'Type': 'series',
            'imdbID': _0x2e33e8.imdbID || ''
          };
          launchEmbed(_0x2e33e8.imdbID, 'series', "vidsrc", currentTvSeason, currentTvEpisode, {
            'title': _0x1a3fb0.name || _0x2e33e8.Title || 'Unknown',
            'skipOmdb': true
          });
        };
        document.getElementById('actionButtons').appendChild(_0x44a88f);
      }
      document.getElementById('episodesSection').style.display = 'block';
      let _0x566eaa = document.getElementById('seasonSelect');
      _0x566eaa.innerHTML = '';
      totalSeasonsCount = Number(_0x1a3fb0.number_of_seasons || 0x0);
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
        loadEpisodesFromTmdb(_0x2e33e8.tmdbId, _0x26486a, _0x2e33e8.imdbID || '');
      };
      loadEpisodesFromTmdb(_0x2e33e8.tmdbId, _0x5ece73, _0x2e33e8.imdbID || '');
      loadSimilarTitlesFromTmdb(_0x2e33e8.tmdbId);
      if (currentOpenOptions) {
        currentOpenOptions.remove();
        currentOpenOptions = null;
      }
      if (_0x459565) {
        let _0x2bf471 = "#detailView?id=" + (_0x2e33e8.imdbID || _0x24629a);
        _0x2bf471 += '&season=' + _0x5ece73 + "&tmdb=" + _0x2e33e8.tmdbId + "&type=anime";
        history.pushState({
          'view': 'detailView',
          'imdbID': _0x2e33e8.imdbID || _0x24629a,
          'season': _0x5ece73,
          'tmdbId': _0x2e33e8.tmdbId,
          'mediaType': 'anime'
        }, '', _0x2bf471);
      }
      switchView("detailView", false);
    })['catch'](_0x5de6b3 => {
      console.error(_0x5de6b3);
    });
    return;
  }
  const _0x2db4f8 = ['movie', 'series', 'episode'];
  const _0x1c6b12 = (_0x1b5ae2 = null) => {
    const _0x58b7b6 = _0x1b5ae2 ? "&type=" + _0x1b5ae2 : '';
    return fetch("https://www.omdbapi.com/?apikey=45e48b11&i=" + _0x24629a + "&plot=full" + _0x58b7b6).then(_0x4a6bd3 => _0x4a6bd3.json());
  };
  const _0x59f4a2 = async () => {
    let _0x2f9b55 = await _0x1c6b12();
    if (_0x2f9b55 && _0x2f9b55.Type) {
      return _0x2f9b55;
    }
    for (const _0x1f0e46 of _0x2db4f8) {
      _0x2f9b55 = await _0x1c6b12(_0x1f0e46);
      if (_0x2f9b55 && _0x2f9b55.Type) {
        return _0x2f9b55;
      }
    }
    return _0x2f9b55;
  };
  _0x59f4a2().then(_0x37197d => {
    currentMovieData = _0x37197d || {};
    totalSeasonsCount = 0x0;
    document.getElementById("detailTitle").textContent = _0x37197d.Title || 'Unknown';
    document.getElementById('detailYear').textContent = formatReleaseText(_0x37197d.Released || '', _0x37197d.Year || 'N/A');
    document.getElementById("detailPlot").textContent = _0x37197d.Plot || '';
    document.getElementById("detailGenre").textContent = _0x37197d.Genre || '';
    document.getElementById("detailCountry").textContent = _0x37197d.Country || '';
    document.getElementById("detailActors").textContent = _0x37197d.Actors || '';
    document.getElementById("detailRating").innerHTML = _0x37197d.imdbID ? "<a href=\"https://www.imdb.com/title/" + _0x37197d.imdbID + "\" target=\"_blank\">IMDB Rating: " + (_0x37197d.imdbRating || 'N/A') + '</a>' : '';
    document.getElementById("detailPoster").src = _0x37197d.Poster && _0x37197d.Poster !== "N/A" ? _0x37197d.Poster : '';
    document.getElementById("actionButtons").innerHTML = '';
    const _0x58b5c7 = (_0x37197d.Type || '').toLowerCase();
    if (_0x58b5c7 !== 'series') {
      let _0x44a88f = document.createElement("button");
      _0x44a88f.textContent = "Watch Now";
      _0x44a88f.onclick = () => {
        if (_0x37197d.imdbID) {
          watchMovieEmbed(_0x37197d.imdbID);
        }
      };
      document.getElementById('actionButtons').appendChild(_0x44a88f);
    }
    if (_0x58b5c7 === "series" && _0x37197d.totalSeasons) {
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
    if (_0x37197d && _0x37197d.imdbID) {
      loadSimilarTitles(_0x37197d);
    }
    if (currentOpenOptions) {
      currentOpenOptions.remove();
      currentOpenOptions = null;
    }
    if (_0x459565) {
      let _0x2bf471 = "#detailView?id=" + _0x24629a;
      if (_0x58b5c7 === 'series') {
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
          const _0x1ff38e = _0x3e82c4 === 'tv' ? _0x4b30c0.first_air_date : _0x4b30c0.release_date;
          return {
            'Title': _0x3e82c4 === 'tv' ? _0x4b30c0.name : _0x4b30c0.title,
            'Year': (_0x3e82c4 === 'tv' ? _0x4b30c0.first_air_date : _0x4b30c0.release_date || '').split('-')[0x0] || 'N/A',
            'ReleaseDate': _0x1ff38e || '',
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
      const _0x33c1db = _0x565fbf.Episodes.length;
      _0x1ae536.classList.toggle('three-column', _0x33c1db > 0x28);
      _0x1ae536.classList.toggle('two-column', _0x33c1db > 0x14 && _0x33c1db <= 0x28);
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
      _0x1ae536.classList.remove('two-column');
      _0x1ae536.classList.remove('three-column');
      _0x1ae536.innerHTML = "<li>No episodes found</li>";
      populateSeasonSwitcher();
      populateEpisodeSwitcher();
      updateEpisodeNavButtons();
    }
  })["catch"](console.error);
}
function loadEpisodesFromTmdb(_0x2f8bc7, _0x1fd2d3, _0x5c8f0a = '') {
  const _0x1ae536 = document.getElementById("episodesList");
  if (!_0x1ae536) {
    return;
  }
  currentTvSeason = String(_0x1fd2d3);
  if (!currentTvEpisode) {
    currentTvEpisode = '1';
  }
  _0x1ae536.innerHTML = '';
  currentEpisodeMap = null;
  currentEpisodeIds = [];
  fetch(TMDB_API_BASE + "/tv/" + _0x2f8bc7 + "/season/" + _0x1fd2d3 + "?api_key=" + TMDB_API_KEY).then(_0x5d1f1c => _0x5d1f1c.json()).then(_0x2b3a4c => {
    if (_0x2b3a4c && _0x2b3a4c.episodes && _0x2b3a4c.episodes.length > 0x0) {
      const _0x1e5b57 = _0x2b3a4c.episodes.length;
      _0x1ae536.classList.toggle('three-column', _0x1e5b57 > 0x28);
      _0x1ae536.classList.toggle('two-column', _0x1e5b57 > 0x14 && _0x1e5b57 <= 0x28);
      currentEpisodeMap = {};
      _0x2b3a4c.episodes.forEach(_0x50c0ea => {
        const _0x3f99b8 = String(_0x50c0ea.episode_number);
        currentEpisodeMap[_0x3f99b8] = _0x50c0ea;
        currentEpisodeIds.push(_0x3f99b8);
        let _0x66c16 = document.createElement('li');
        _0x66c16.textContent = "Episode " + _0x50c0ea.episode_number + " - " + _0x50c0ea.name;
        _0x66c16.onclick = function (_0x413eed) {
          _0x413eed.stopPropagation();
          if (_0x5c8f0a) {
            showEpisodeOptions(this, _0x5c8f0a, _0x1fd2d3, _0x50c0ea.episode_number);
          }
        };
        _0x1ae536.appendChild(_0x66c16);
      });
      populateSeasonSwitcher();
      populateEpisodeSwitcher();
      updateEpisodeNavButtons();
    } else {
      _0x1ae536.classList.remove('two-column');
      _0x1ae536.classList.remove('three-column');
      _0x1ae536.innerHTML = "<li>No episodes found</li>";
      populateSeasonSwitcher();
      populateEpisodeSwitcher();
      updateEpisodeNavButtons();
    }
  })['catch'](_0x2f2cda => {
    console.error(_0x2f2cda);
    _0x1ae536.innerHTML = "<li>Error loading episodes</li>";
  });
}

function loadSimilarTitlesFromTmdb(_0x1b2b8f) {
  const _0x39a6db = document.getElementById('similarResults');
  const _0x2b6f4d = document.getElementById('similarLoading');
  if (!_0x39a6db) {
    return;
  }
  if (_0x2b6f4d) {
    _0x2b6f4d.style.display = 'block';
  }
  _0x39a6db.innerHTML = '';
  fetch(TMDB_API_BASE + "/tv/" + _0x1b2b8f + "/recommendations?api_key=" + TMDB_API_KEY).then(_0x8f0c7 => _0x8f0c7.json()).then(_0x8d64c5 => {
    if (!_0x8d64c5 || !_0x8d64c5.results || _0x8d64c5.results.length === 0x0) {
      if (_0x2b6f4d) {
        _0x2b6f4d.style.display = 'none';
      }
      _0x39a6db.innerHTML = "<p>No similar titles found.</p>";
      return;
    }
    const _0x7a0d62 = _0x8d64c5.results.slice(0x0, 0xc);
    const _0x373ea4 = _0x7a0d62.map(_0x4b30c0 => {
      return fetch(TMDB_API_BASE + "/tv/" + _0x4b30c0.id + "/external_ids?api_key=" + TMDB_API_KEY).then(_0x2b2e03 => _0x2b2e03.json()).then(_0x1feac1 => {
        return {
          'Title': _0x4b30c0.name,
          'Year': (_0x4b30c0.first_air_date || '').split('-')[0x0] || 'N/A',
          'ReleaseDate': _0x4b30c0.first_air_date || '',
          'Poster': _0x4b30c0.poster_path ? TMDB_IMAGE_BASE + _0x4b30c0.poster_path : '',
          'imdbID': _0x1feac1 ? _0x1feac1.imdb_id : ''
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
  })['catch'](_0x3f3dcf => {
    console.error(_0x3f3dcf);
    if (_0x2b6f4d) {
      _0x2b6f4d.style.display = 'none';
    }
    _0x39a6db.innerHTML = "<p>Error loading similar titles.</p>";
  });
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
    const _0x2f7a8b = document.createElement('div');
    _0x2f7a8b.className = 'episode-info';
    const _0x2f8ed1 = currentEpisodeMap ? currentEpisodeMap[String(_0x11bc44)] : null;
    if (_0x2f8ed1 && _0x2f8ed1.still_path) {
      const _0x145f2c = document.createElement('img');
      _0x145f2c.className = 'episode-poster';
      _0x145f2c.src = TMDB_IMAGE_BASE.replace('/w342', '/w500') + _0x2f8ed1.still_path;
      _0x145f2c.alt = _0x2f8ed1.name || 'Episode Image';
      _0x2f7a8b.appendChild(_0x145f2c);
    }
    const _0x2e6d46 = document.createElement('div');
    _0x2e6d46.className = 'episode-info-title';
    _0x2e6d46.textContent = _0x2f8ed1 && _0x2f8ed1.name ? _0x2f8ed1.name : "Episode " + _0x11bc44;
    _0x2f7a8b.appendChild(_0x2e6d46);
    const _0x5e3a8e = document.createElement('div');
    _0x5e3a8e.className = 'episode-info-date';
    _0x5e3a8e.textContent = _0x2f8ed1 && _0x2f8ed1.air_date ? formatEpisodeAirDate(_0x2f8ed1.air_date) : 'N/A';
    _0x2f7a8b.appendChild(_0x5e3a8e);
    const _0x1c4ed2 = document.createElement('div');
    _0x1c4ed2.className = 'episode-info-synopsis';
    _0x1c4ed2.textContent = _0x2f8ed1 && _0x2f8ed1.overview ? _0x2f8ed1.overview : 'Synopsis not available.';
    _0x2f7a8b.appendChild(_0x1c4ed2);
    _0x266d12.appendChild(_0x2f7a8b);
    let _0x2b0d88 = document.createElement("button");
    _0x2b0d88.textContent = "Watch Now";
    _0x2b0d88.onclick = function (_0x2ecb0f) {
      _0x2ecb0f.stopPropagation();
      currentTvSeason = _0x2f1513;
      currentTvEpisode = _0x11bc44;
      if (_0x42b8b5.dataset && _0x42b8b5.dataset.tmdbId) {
        currentTmdbId = _0x42b8b5.dataset.tmdbId;
      }
      let _0x53ce98 = "#embedViewerView?type=series&id=" + _0x5a8139 + "&season=" + _0x2f1513 + "&episode=" + _0x11bc44 + '&server=vidsrc' + (currentTmdbId ? '&tmdb=' + currentTmdbId : '');
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
function launchEmbed(_0x2ca902, _0x1f84ec, _0x4cdba6, _0x429c53 = null, _0x4407b5 = null, _0x11c92e = null) {
  currentEmbedServer = _0x4cdba6;
  if (_0x11c92e && _0x11c92e.tmdbId) {
    currentTmdbId = _0x11c92e.tmdbId;
  }
  let _0xc432cc = '';
  if (_0x1f84ec === 'movie') {
    if (_0x4cdba6 === "vidsrc") {
      _0xc432cc = "https://vidsrcme.ru/embed/movie?imdb=" + _0x2ca902;
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
      _0xc432cc = "https://vidsrcme.ru/embed/tv?imdb=" + _0x2ca902 + "&season=" + _0x429c53 + "&episode=" + _0x4407b5;
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
    if (currentTmdbId) {
      loadEpisodesFromTmdb(currentTmdbId, _0x429c53, _0x2ca902);
    } else {
      loadEpisodes(_0x2ca902, _0x429c53);
    }
  }
  updateEpisodeNavButtons();
  if (_0x11c92e && _0x11c92e.skipOmdb) {
    if (_0x11c92e.title) {
      currentMovieData = {
        'Title': _0x11c92e.title,
        'Type': _0x1f84ec
      };
    }
    showEmbedViewer();
    return;
  }
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
function isSeriesLikeEmbed() {
  const _0x50630a = window.location.hash.split('?')[0x1] || '';
  const _0x3ee3e8 = new URLSearchParams(_0x50630a);
  const _0x5a5c30 = _0x3ee3e8.get('type') || '';
  const _0x1b0a3a = currentMovieData && currentMovieData.Type ? currentMovieData.Type : _0x5a5c30;
  return (_0x1b0a3a || '').toLowerCase() !== 'movie';
}
function showEmbedViewer() {
  const _0x615853 = document.getElementById('serverDropdown');
  if (_0x615853) {
    _0x615853.style.display = 'inline-block';
  }
  const _0x2dcf50 = isSeriesLikeEmbed();
  const _0x1b7f7c = document.getElementById('seriesOverviewBtn');
  if (_0x1b7f7c) {
    _0x1b7f7c.style.display = _0x2dcf50 ? 'inline-block' : 'none';
  }
  const _0x40d1eb = document.getElementById('seasonDropdown');
  if (_0x40d1eb) {
    _0x40d1eb.style.display = _0x2dcf50 ? 'inline-block' : 'none';
  }
  const _0x1f4e8a = document.getElementById('episodeDropdown');
  if (_0x1f4e8a) {
    _0x1f4e8a.style.display = _0x2dcf50 ? 'inline-block' : 'none';
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
  const _0x2b86f6 = _0x17c7a4 === 'filterView' ? 'searchView' : _0x17c7a4;
  document.getElementById(_0x2b86f6).classList.add("active");
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
  const _0x2f6d55 = _0x1b6324.get('tmdb') || currentTmdbId;
  if (_0x1c6a9f) {
    if (_0x2f6d55) {
      showMovieDetails(_0x1c6a9f, true, _0x1c3f6e, {
        'useTmdb': true,
        'tmdbId': _0x2f6d55,
        'imdbID': _0x1c6a9f
      });
    } else {
      showMovieDetails(_0x1c6a9f, true, _0x1c3f6e);
    }
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
  const _0x53f8d1 = isSeriesLikeEmbed();
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
  launchEmbed(_0x1960ce, _0x7f9c8a, _0x4c4f3f, _0x14f2b6.season, _0x14f2b6.episode, currentTmdbId ? {
    'tmdbId': currentTmdbId,
    'skipOmdb': true
  } : null);
}

function populateEpisodeSwitcher() {
  const _0x23f42a = document.getElementById('episodeMenu');
  const _0x28c5b2 = document.getElementById('episodeToggle');
  const _0x4e255a = document.getElementById('episodeDropdown');
  if (!_0x23f42a || !_0x28c5b2 || !_0x4e255a) {
    return;
  }
  const _0x4d69bb = isSeriesLikeEmbed();
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
  const _0x30a2c4 = isSeriesLikeEmbed();
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
  if (currentTmdbId) {
    loadEpisodesFromTmdb(currentTmdbId, _0x4f4b3a, _0x421f15);
  } else {
    loadEpisodes(_0x421f15, _0x4f4b3a);
  }
  launchEmbed(_0x421f15, _0x3e93b4, _0x5794f2, _0x4f4b3a, '1', currentTmdbId ? {
    'tmdbId': currentTmdbId,
    'skipOmdb': true
  } : null);
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
    'label': 'vidsrcme.ru'
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
function ensureIframeFullscreenPermissions(_0x1a8c1c = document) {
  if (!_0x1a8c1c) {
    return;
  }
  const _0x3f1d2f = _0x1a8c1c.querySelectorAll ? _0x1a8c1c.querySelectorAll('iframe') : [];
  _0x3f1d2f.forEach(_0x2ac0c4 => {
    if (!_0x2ac0c4) {
      return;
    }
    const _0x430b12 = _0x2ac0c4.getAttribute('allow') || '';
    if (!_0x430b12.toLowerCase().includes('fullscreen')) {
      _0x2ac0c4.setAttribute('allow', _0x430b12 ? _0x430b12 + '; fullscreen *' : 'fullscreen *');
    } else if (!_0x430b12.includes('*') && !_0x430b12.includes('fullscreen *')) {
      _0x2ac0c4.setAttribute('allow', _0x430b12.replace(/fullscreen/gi, 'fullscreen *'));
    }
    if (!_0x2ac0c4.hasAttribute('allowfullscreen')) {
      _0x2ac0c4.setAttribute('allowfullscreen', '');
    }
  });
}
window.addEventListener('load', () => {
  const _0x2cfb8b = window.location.hash;
  const _0x4dbb8a = document.getElementById('embedFrame');
  const _0x1e71f6 = document.getElementById('searchTypeFilter');
  if (_0x4dbb8a) {
    _0x4dbb8a.addEventListener('load', () => {
      setEpisodeLoading(false);
    });
  }
  if (_0x1e71f6) {
    _0x1e71f6.addEventListener('change', () => {
      updateGenreDropdownByType();
    });
  }
  ensureIframeFullscreenPermissions();
  const _0x1d2c1a = new MutationObserver(_0x5f7993 => {
    _0x5f7993.forEach(_0x5c27a4 => {
      _0x5c27a4.addedNodes.forEach(_0x1ad3b4 => {
        if (_0x1ad3b4 && _0x1ad3b4.nodeType === Node.ELEMENT_NODE) {
          if (_0x1ad3b4.tagName === 'IFRAME') {
            ensureIframeFullscreenPermissions(_0x1ad3b4.parentNode || document);
          } else {
            ensureIframeFullscreenPermissions(_0x1ad3b4);
          }
        }
      });
    });
  });
  _0x1d2c1a.observe(document.body, {
    childList: true,
    subtree: true
  });
  document.addEventListener('click', _0x16786f => {
    const _0x2a3e2f = document.getElementById('episodeDropdown');
    const _0x1a2b54 = document.getElementById('seasonDropdown');
    const _0x430caa = document.getElementById('serverDropdown');
    const _0x7a2c9e = document.getElementById('homePageSelect');
    if (_0x2a3e2f && !_0x2a3e2f.contains(_0x16786f.target)) {
      closeEpisodeMenu();
    }
    if (_0x1a2b54 && !_0x1a2b54.contains(_0x16786f.target)) {
      closeSeasonMenu();
    }
    if (_0x430caa && !_0x430caa.contains(_0x16786f.target)) {
      closeServerMenu();
    }
    if (_0x7a2c9e && !_0x7a2c9e.contains(_0x16786f.target)) {
      closeHomePageSelectMenu();
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
    const _0x3dd1e3 = _0x1dab97.get('tmdb');
    const _0x1d9bc0 = _0x1dab97.get('type');
    if (_0x2b452d) {
      if (_0x1d9bc0 === 'anime' && _0x3dd1e3) {
        showMovieDetails(_0x2b452d, false, _0x51e517, {
          'useTmdb': true,
          'tmdbId': _0x3dd1e3,
          'imdbID': _0x2b452d
        });
      } else {
        showMovieDetails(_0x2b452d, false, _0x51e517);
      }
    }
    } else {
    if (_0x53db18 === "embedViewerView") {
      const _0x4236da = _0x1dab97.get("type");
      const _0x57ad7f = _0x1dab97.get('id');
      const _0xa44445 = _0x1dab97.get("server") || 'vidsrc';
      const _0x338b08 = _0x1dab97.get('season');
      const _0x18ac1d = _0x1dab97.get("episode");
      const _0x4e4a0f = _0x1dab97.get('tmdb');
      currentEmbedServer = _0xa44445;
      if (_0x4e4a0f) {
        currentTmdbId = _0x4e4a0f;
      }
      launchEmbed(_0x57ad7f, _0x4236da, _0xa44445, _0x338b08, _0x18ac1d, _0x4e4a0f ? {
        'tmdbId': _0x4e4a0f,
        'skipOmdb': true
      } : null);
    } else {
    if (_0x53db18 === "searchView") {
      const _0x334a29 = _0x1dab97.get("query");
      const _0x2f6568 = parseInt(_0x1dab97.get("page")) || 0x1;
      const _0x3b0b1b = _0x1dab97.get("type") || 'all';
      const _0x5b5c65 = _0x1dab97.get("sort") || 'new';
      const _0x2a6ef0 = _0x1dab97.get("genre") || '';
      if (_0x334a29) {
        document.getElementById("searchInput").value = _0x334a29;
        const _0x1f2b55 = document.getElementById('searchTypeFilter');
        const _0x3f0f1d = document.getElementById('searchSortFilter');
        if (_0x1f2b55) {
          _0x1f2b55.value = _0x3b0b1b;
        }
        if (_0x3f0f1d) {
          updateGenreDropdownByType(_0x2a6ef0 ? normalizeGenreText(_0x2a6ef0) : _0x5b5c65);
        }
        currentSearchKeyword = _0x334a29;
        currentSearchPage = _0x2f6568;
        searchTmdb(_0x334a29, _0x2f6568);
      }
    } else {
      if (_0x53db18 === "filterView") {
        const _0x2f6568 = parseInt(_0x1dab97.get("page")) || 0x1;
        const _0x3b0b1b = _0x1dab97.get("type") || 'all';
        const _0x5b5c65 = _0x1dab97.get("sort") || 'new';
        const _0x2a6ef0 = _0x1dab97.get("genre") || '';
        const _0x19c297 = document.getElementById("searchInput");
        if (_0x19c297) {
          _0x19c297.value = '';
        }
        const _0x1f2b55 = document.getElementById('searchTypeFilter');
        const _0x3f0f1d = document.getElementById('searchSortFilter');
        if (_0x1f2b55) {
          _0x1f2b55.value = _0x3b0b1b;
        }
        if (_0x3f0f1d) {
          updateGenreDropdownByType(_0x2a6ef0 ? normalizeGenreText(_0x2a6ef0) : _0x5b5c65);
        }
        currentSearchKeyword = '';
        currentSearchPage = _0x2f6568;
        searchFilters(_0x2f6568);
      } else {
        switchView("homeView", false);
        setHomeTab(HOME_TAB_DEFAULT);
      }
      }
    }
  }
  updateGenreDropdownByType();
});
window.addEventListener("popstate", _0x53e716 => {
  if (_0x53e716.state && _0x53e716.state.view) {
    switchView(_0x53e716.state.view, false);
  } else {
    switchView("homeView", false);
  }
});
// Deployed via Render
