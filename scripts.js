import { config } from './config.js';

const auth0 = window.auth0; // Auth0 will be globally available
// DOM elements
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorDetails = document.getElementById('error-details');
const loggedOutSection = document.getElementById('logged-out');
const loggedInSection = document.getElementById('logged-in');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const profileContainer = document.getElementById('profile');
let auth0Client;

// Initialize Auth0 client
async function initAuth0() {
  try {
    // Validate environment variables
    const domain = config.auth0Domain;
    const clientId = config.auth0ClientId;

    if (!domain || !clientId) {
      throw new Error('Auth0 configuration missing. Please check your config.js file for auth0Domain and auth0ClientId');
    }

    // Normalize and validate Auth0 domain format
    let hostname = domain;
    try {
      // Allow developers to accidentally include protocol, e.g. "https://your-domain.auth0.com"
      if (typeof domain === 'string' && (domain.startsWith('http://') || domain.startsWith('https://') || domain.includes('://'))) {
        const parsed = new URL(domain);
        hostname = parsed.hostname;
      }
    } catch (e) {
      // If URL parsing fails, fall back to the raw domain string
      hostname = domain;
    }

    const allowedAuth0Suffixes = [
      '.auth0.com',
      '.us.auth0.com',
      '.eu.auth0.com',
      '.au.auth0.com'
    ];

    const hasValidAuth0Suffix = allowedAuth0Suffixes.some(suffix => typeof hostname === 'string' && hostname.endsWith(suffix));

    if (!hasValidAuth0Suffix) {
      console.warn('Auth0 domain format might be incorrect. Expected format: your-domain.auth0.com');
    }

    auth0Client = await window.auth0.createAuth0Client({
      domain: domain,
      clientId: clientId,
      // Persist tokens across pages / reloads and allow refresh tokens
      cacheLocation: 'localstorage',
      useRefreshTokens: true,
      authorizationParams: {
        // Redirect back to the same page the user initiated login from
        redirect_uri: window.location.origin + window.location.pathname
      }
    });

    // Check if user is returning from login
    if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
      await handleRedirectCallback();
    }

    // Update UI based on authentication state
    await updateUI();
  } catch (err) {
    console.error('Auth0 initialization error:', err);
    showError(err.message);
  }
}

// Handle redirect callback
async function handleRedirectCallback() {
  try {
    await auth0Client.handleRedirectCallback();
    // Clean up the URL to remove query parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  } catch (err) {
    console.error('Redirect callback error:', err);
    showError(err.message);
  }
}

// Update UI based on authentication state
async function updateUI() {
  try {
    const isAuthenticated = await auth0Client.isAuthenticated();

    if (isAuthenticated) {
      showLoggedIn();
      await displayProfile();
    } else {
      showLoggedOut();
    }

    hideLoading();
  } catch (err) {
    console.error('UI update error:', err);
    showError(err.message);
  }
}

// Display user profile
async function displayProfile() {
  try {
    const user = await auth0Client.getUser();
    const placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Ccircle cx='25' cy='25' r='25' fill='%2363b3ed'/%3E%3Cpath d='M55 50c8.28 0 15-6.72 15-15s-6.72-15-15-15-15 6.72-15 15 6.72 15 15 15zm0 7.5c-10 0-30 5.02-30 15v3.75c0 2.07 1.68 3.75 3.75 3.75h52.5c2.07 0 3.75-1.68 3.75-3.75V72.5c0-9.98-20-15-30-15z' fill='%23fff'/%3E%3C/svg%3E`;

    profileContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 5px;">
        <img 
          src="${user.picture || placeholderImage}" 
          alt="${user.name || 'User'}" 
          class="profile-picture"
          onerror="this.src='${placeholderImage}'"
        />
        <div style="text-align: center;">
          <div class="profile-email" style="font-weight: 600; color: #a0aec0;">
            ${user.email || 'No email provided'}
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Error displaying profile:', err);
  }
}

// Event handlers
async function login() {
  try {
    await auth0Client.loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin + window.location.pathname
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    showError(err.message);
  }
}

async function logout() {
  try {
    await auth0Client.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  } catch (err) {
    console.error('Logout error:', err);
    showError(err.message);
  }
}

function hideLoading() {
  loading.style.display = 'none';
}

function showError(message) {
  loading.style.display = 'none';
  error.style.display = 'block';
  errorDetails.textContent = message;
}

function showLoggedIn() {
  loggedOutSection.style.display = 'none';
  loggedInSection.style.display = 'flex';
}

function showLoggedOut() {
  loggedInSection.style.display = 'none';
  loggedOutSection.style.display = 'flex';
}
// Event listeners
loginBtn.addEventListener('click', login);

logoutBtn.addEventListener('click', logout);

// Initialize the app
initAuth0();


















































const PROXY_BASE = "https://itad-proxy.ivanprokopenkose7en.workers.dev";

let matchingGames = [];
function showHints(hints) {

  const hintsContainer = document.querySelector(".search-hints");
  hintsContainer.innerHTML = "";
  const hintList = hintsContainer.appendChild(document.createElement("ul"));
  hints.forEach((hint) => {
    const hintEl = hintList.appendChild(document.createElement("li"))
    // Store slug-to-ID mapping for later lookup
    setCachedData(`slug_${hint.slug}`, hint.id);
    // Use clean path-based URLs
    hintEl.innerHTML = `<a href="/game/${hint.slug}">${hint.title}</a>`;
  });

}


/* STEAM API IMPLEMENTATION (COMMENTED OUT)
async function fetchSteamDescription(appid) {
  if (!appid) return null;

  try {
    // Use CORS proxy for Steam API
    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(`https://store.steampowered.com/api/appdetails?appids=${appid}`)}`);
    const data = await response.json();
    console.log("Steam description data:", data);
    if (data[appid]?.success && (data[appid]?.data?.short_description || data[appid]?.data?.about_the_game)) {
      return data[appid].data.about_the_game || data[appid].data.short_description;
    }
  } catch (error) {
    console.error("Error fetching Steam description:", error);
  }
  return null;
}
*/

// Helper function to try an IGDB query
async function tryIGDBQuery(queryCondition) {
  try {
    const response = await fetch(`${PROXY_BASE}?api=igdb&endpoint=games`, {
      method: 'POST',
      body: `fields name,storyline,summary; ${queryCondition}; limit 1;`
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error in IGDB query:", error);
    return null;
  }
}

// IGDB API implementation with fallback strategies
async function fetchIGDBSummary(gameInfo) {
  if (!gameInfo) return null;
  
  // Try slug first
  let data = await tryIGDBQuery(`where slug = "${gameInfo.slug}"`);
  
  // If slug fails, try title search
  if (!data || data.length === 0) {
    data = await tryIGDBQuery(`search "${gameInfo.title}"`);
  }

  if (data && data.length > 0) {
    if (data[0].summary) {
      return { text: data[0].summary, source: 'IGDB' };
    }
    if (data[0].storyline) {
      return { text: data[0].storyline, source: 'IGDB' };
    }
  }
  return null;
}

// RAWG API implementation for fetching game description
async function fetchRAWGDescription(gameName) {
  if (!gameName) return null;

  try {
    const apiKey = config.rawgApiKey;
    if (!apiKey) {
      console.warn('RAWG API key not configured');
      return null;
    }

    // Search for the game
    const searchResponse = await fetch(
      `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(gameName)}&page_size=1`
    );

    if (!searchResponse.ok) {
      console.error("RAWG search error:", searchResponse.statusText);
      return null;
    }

    const searchData = await searchResponse.json();
    console.log("RAWG search data:", searchData);

    if (searchData.results && searchData.results.length > 0) {
      const gameId = searchData.results[0].id;

      // Get detailed game info
      const detailResponse = await fetch(
        `https://api.rawg.io/api/games/${gameId}?key=${apiKey}`
      );

      if (!detailResponse.ok) {
        console.error("RAWG detail error:", detailResponse.statusText);
        return null;
      }

      const details = await detailResponse.json();
      console.log("RAWG details:", details);

      if (details.description) {
        // Remove HTML tags from description
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = details.description;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';
        return { text: plainText.trim(), source: 'RAWG' };
      }
    }
  } catch (error) {
    console.error("Error fetching RAWG description:", error);
  }
  return null;
}

// Validate if description is good quality (not promotional text)
function isValidDescription(text) {
  if (!text || text.length < 80) return false;

  // Check for promotional keywords that indicate marketing text
  const promoKeywords = [
    'now available',
    'buy now',
    'purchase',
    'bundle',
    'features include',
    'available as a bundle'
  ];

  const lowerText = text.toLowerCase();
  const hasPromoKeywords = promoKeywords.some(keyword => lowerText.includes(keyword));

  return !hasPromoKeywords;
}

// Resolve game slug to ID using cache or search API
async function resolveSlugToId(slug) {
  // Check cache first
  const cacheKey = `slug_${slug}`;
  const cachedId = getCachedData(cacheKey);
  if (cachedId) {
    return cachedId;
  }

  // If not in cache, search for the game
  try {
    const response = await fetch(`${PROXY_BASE}?endpoint=/games/search/v1&title=${encodeURIComponent(slug)}`);
    const data = await response.json();
    if (data && data.length > 0) {
      // Find best match by slug
      const game = data.find(g => g.slug === slug) || data[0];
      setCachedData(cacheKey, game.id);
      return game.id;
    }
  } catch (error) {
    console.error('Error resolving slug to ID:', error);
  }
  return null;
}

// Main function to fetch game description with fallback
async function fetchGameDescription(gameInfo) {
  if (!gameInfo) return { text: 'Description unavailable', source: null };

  // Try IGDB first
  let result = await fetchIGDBSummary(gameInfo);

  // If IGDB returns short or promotional text, try RAWG
  if (!result || !isValidDescription(result.text)) {
    console.log('IGDB description inadequate, trying RAWG...');
    const rawgResult = await fetchRAWGDescription(gameInfo.title);
    if (rawgResult && isValidDescription(rawgResult.text)) {
      result = rawgResult;
    }
  }

  return result || { text: 'Description unavailable', source: null };
}

function renderDeals(game, slug) {
  const gameList = document.querySelector(".game-list");
  document.querySelector(".title").innerText = slug;
  game.deals.forEach((deal) => {
    const dealDiv = document.createElement("li");
    const dealA = document.createElement("a");
    dealDiv.classList.add("game-list_deal");
    dealA.classList.add("game-list_link");
    dealA.href = deal.url;
    dealA.target = "_blank";
    dealA.innerHTML = `
      <div class="game-list_shop">${deal.shop.name}</div>
      <div class="game-list_sale">$${deal.price.amount}</div>
      <div class="game-list_discount">${deal.cut}%</div>
    `;
    dealDiv.appendChild(dealA);
    gameList.appendChild(dealDiv);
  });
}
async function showGameSidebar(gameInfo) {
  const sidebar = document.querySelector(".game-sidebar");
  sidebar.innerHTML = "";

  // Fetch game description with fallback
  const descriptionResult = await fetchGameDescription(gameInfo);
  const descriptionText = descriptionResult.text;
  const source = descriptionResult.source;

  // Determine attribution link
  let attributionHTML = 'summary unavailable';
  if (source === 'IGDB') {
    attributionHTML = 'summary by <a target="_blank" href="https://www.igdb.com/">IGDB</a>';
  } else if (source === 'RAWG') {
    attributionHTML = 'summary by <a target="_blank" href="https://rawg.io/">RAWG</a>';
  }

  sidebar.innerHTML = `
    <div class="game-sidebar_banner">
      <img src="${gameInfo.assets.banner400}" alt="${gameInfo.title} Banner">
    </div>
    <div class="game-sidebar_block">
      <ul class="game-sidebar_tags">
        ${gameInfo.tags.map(tag => `<li class="game-sidebar_tag">${tag}</li>`).join('')}
      </ul>
      <div class="game-sidebar_description">
        ${descriptionText}
      </div>
      <span class="game-sidebar_metacritic">${attributionHTML}</span>
    </div>
`;

}
const FULL_CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
function getCachedData(key) {
  const cachedItem = localStorage.getItem(key);
  if (!cachedItem) return null;

  if (cachedItem.timestamp + CACHE_DURATION < Date.now()) {
    localStorage.removeItem(key);
    return null;
  }
  return JSON.parse(cachedItem).data;
}
function clearDayOldStorage() {
  Object.keys(localStorage).forEach(key => {
    try {
      const { timestamp } = JSON.parse(localStorage.getItem(key));
      if (timestamp + FULL_CACHE_DURATION < Date.now()) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      localStorage.removeItem(key);
    }
  });
}

function setCachedData(key, data) {
  const cacheObject = {
    data: data,
    timestamp: Date.now()
  };
  localStorage.setItem(key, JSON.stringify(cacheObject));
}



document.addEventListener("DOMContentLoaded", async () => {
  clearDayOldStorage();
  
  // Check if redirected from 404.html (GitHub Pages)
  let pathToUse = window.location.pathname;
  const redirectPath = sessionStorage.getItem('redirectPath');
  if (redirectPath) {
    pathToUse = redirectPath;
    sessionStorage.removeItem('redirectPath');
    history.replaceState(null, '', redirectPath);
  }
  
  const pathParts = pathToUse.split('/');
  const slug = pathParts[pathParts.length - 1];

  if (slug && slug !== 'game' && slug !== 'game.html') {
    const appID = await resolveSlugToId(slug);
    
    if (!appID) {
      console.error('Could not resolve game slug to ID');
      return;
    }

    const cacheKey = `deals_${appID}`;
    const cachedDeals = getCachedData(cacheKey);
    
    fetch(`${PROXY_BASE}?endpoint=/games/info/v2&id=${appID}`)
      .then(response => response.json())
      .then(gameInfo => {
        showGameSidebar(gameInfo);
        if (cachedDeals) {
          renderDeals(cachedDeals, gameInfo.title);
        }
      })
      .catch(error => console.error("Error fetching game info:", error));
    
    if (!cachedDeals) {
      fetch(`${PROXY_BASE}?endpoint=/games/prices/v3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([appID])
      })
        .then((response) => response.json())
        .then((pricesArray) => {
          // API returns array with one object: [{ id, historyLow, deals }]
          const gamePrices = pricesArray[0];
          renderDeals(gamePrices, slug);
          setCachedData(cacheKey, gamePrices);
        })
        .catch((error) => console.error("Error fetching game info:", error));
    }
  }
  //searching
  const searchBar = document.getElementById("searchBar");
  if (searchBar) {
    searchBar.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      if (searchTerm.length === 0) {
        showHints([]);
        return;
      }
      fetch(`${PROXY_BASE}?endpoint=/games/search/v1&title=${encodeURIComponent(searchTerm)}&results=5`)

        .then((response) => response.json())
        .then((data) => {
          matchingGames = data;
          const filteredHints = matchingGames.filter((game) =>
            game.title.toLowerCase().includes(searchTerm)
          );
          showHints(filteredHints)
        })
        .catch((error) => console.error("Error fetching hints:", error));
    });
  }

});


/*
 1. pass all filter data to url
 2. read url parameters and make a fetch request with those parameters(apply default parameters if not provided)
*/
